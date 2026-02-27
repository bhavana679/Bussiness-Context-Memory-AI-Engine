import logging
import secrets
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models.user import User

logger = logging.getLogger(__name__)

# Industry-standard bcrypt password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hashes a password using bcrypt with an automatic salt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Securely verifies a plain text password against a bcrypt hash.
    Also handles legacy SHA-256 hashes for backward compatibility.
    """
    # First try bcrypt verify
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        pass

    # Fallback: support legacy SHA-256 hashes existing in DB
    import hashlib
    legacy_hash = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    if legacy_hash == hashed_password:
        return True

    return False


def generate_token() -> str:
    """Generates a secure cryptographically strong random token."""
    return secrets.token_hex(32)


def create_user(db: Session, email: str, password: str, role: str) -> User:
    """Registers a new authorized user with bcrypt-hashed password."""
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise ValueError("An account with this email already exists.")

    new_user = User(
        email=email,
        hashed_password=hash_password(password),
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info(f"New user registered: {email} with role={role}")
    return new_user


def authenticate_user(db: Session, email: str, password: str) -> User:
    """Validates user credentials using bcrypt (with SHA-256 legacy fallback)."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user

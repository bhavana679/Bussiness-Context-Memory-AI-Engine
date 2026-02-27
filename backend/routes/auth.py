from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas.schemas import UserCreate, UserLogin, AuthResponse
from services.auth_service import create_user, authenticate_user
from services.jwt_service import create_access_token

router = APIRouter(prefix="/auth")


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(data: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user and returns a signed JWT token."""
    try:
        user = create_user(db, data.email, data.password, data.role)
        token = create_access_token({"sub": user.email, "role": user.role})
        return AuthResponse(token=token, role=user.role, email=user.email)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=AuthResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticates a user and returns a signed JWT token."""
    user = authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user.email, "role": user.role})
    return AuthResponse(token=token, role=user.role, email=user.email)

import React from 'react';

const KpiCard = React.memo((props) => {
    const { icon: Icon, label, value, colorClass = "indigo" } = props;
    const colorStyles = {
        indigo: "bg-indigo-50  text-indigo-600  ",
        yellow: "bg-yellow-50  text-yellow-600  ",
        red: "bg-red-50  text-red-600  ",
        green: "bg-green-50  text-green-600  ",
    };

    return (
        <div className={`bg-white  rounded-2xl shadow-sm p-6 border border-gray-100  flex items-center hover:shadow-xl transition-all group ${colorStyles[colorClass]}`}>
            <div className={`p-3 rounded-2xl mr-4 group-hover:scale-110 transition-transform ${colorStyles[colorClass].split(' ').slice(0, 3).join(' ')}`}>
                {Icon && <Icon size={24} />}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-gray-900  tracking-tighter mt-1">{value}</p>
            </div>
        </div>
    );
});

export default KpiCard;

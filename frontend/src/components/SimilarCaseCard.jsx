import React from 'react';
import { Activity, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SimilarCaseCard = React.memo(({ similarity, date, event, outcome }) => {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'hi' ? 'hi-IN-u-nu-deva' : 'en-IN';
    const formatNumber = (val) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(val);

    return (
        <div className="group flex items-start gap-6 p-6 rounded-3xl border border-gray-100  hover:border-purple-200  hover:bg-purple-50/30  transition-all transition-transform hover:scale-[1.01]">
            <div className="mt-1 p-3 bg-purple-100  text-purple-700  rounded-2xl group-hover:bg-purple-200  transition-colors">
                <Activity size={18} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-black text-purple-600  uppercase tracking-widest bg-purple-50  px-3 py-1 rounded-full">
                        {t('profile.similarity')}: {formatNumber(similarity * 100)}%
                    </p>
                    <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                        <Calendar size={12} className="mr-2" /> {date}
                    </div>
                </div>
                <p className="text-gray-800  font-black text-lg leading-tight mb-3 tracking-tight">{event}</p>
                {outcome && (
                    <div className="mt-2 text-[10px] font-black text-gray-500  bg-gray-50  px-4 py-2 rounded-xl border border-gray-100  inline-block uppercase tracking-widest shadow-sm">
                        {t('profile.resolution')}: {outcome}
                    </div>
                )}
            </div>
        </div>
    );
});

export default SimilarCaseCard;

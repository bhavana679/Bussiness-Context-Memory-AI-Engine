import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Technical: Helper to get risk color based on score
 */
const getRiskColor = (score) => {
    if (score >= 80) return '#ef4444'; // Red
    if (score >= 40) return '#eab308'; // Yellow
    return '#22c55e'; // Green
};

const RiskGauge = ({ score = 0 }) => {
    const { i18n, t } = useTranslation();
    const locale = i18n.language === 'hi' ? 'hi-IN-u-nu-deva' : 'en-IN';
    const dashOffset = 515 - (515 * score) / 100;

    const formatNumber = (val) => new Intl.NumberFormat(locale).format(val);

    return (
        <div className="flex flex-col items-center justify-center mb-10">
            <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-[14px] border-gray-50  group hover:border-gray-100  transition-all duration-300">
                <svg className="absolute w-full h-full -rotate-90" aria-label="Risk Gauge SVG">
                    <circle
                        cx="96" cy="96" r="82"
                        fill="none"
                        stroke={getRiskColor(score)}
                        strokeWidth="14"
                        strokeDasharray="515"
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="text-center group-hover:scale-110 transition-all">
                    <span className="text-6xl font-black text-gray-900  leading-none tracking-tighter">{formatNumber(score)}</span>
                    <p className="text-[9px] font-black text-gray-400 uppercase mt-2 tracking-[0.2em]">{t('profile.riskGrade')}</p>
                </div>
            </div>
            <div className={`mt-8 px-8 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transform hover:scale-105 transition-all ${score >= 80 ? 'bg-red-50  text-red-700  border-red-100  font-black' :
                score >= 40 ? 'bg-yellow-50  text-yellow-700  border-yellow-100  font-black' :
                    'bg-green-50  text-green-700  border-green-100  font-black'
                }`} data-testid="risk-status">
                {score >= 80 ? t('common.highRisk') : score >= 40 ? t('common.mediumRisk') : t('common.lowRisk')}
            </div>
        </div>
    );
};

export default RiskGauge;

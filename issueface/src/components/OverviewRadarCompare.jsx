import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { getPressData } from '../utils/pressFreedom';
import { getToneDistribution } from '../utils/toneDistribution';

function OverviewRadarCompare({ c1Name, c2Name, c1Code, c2Code, count1, count2, articles1, articles2 }) {
  const pf1 = getPressData(c1Code);
  const pf2 = getPressData(c2Code);
  const dist1 = getToneDistribution(articles1);
  const dist2 = getToneDistribution(articles2);
  const maxCount = Math.max(count1, count2, 1);
  const normalizeCount = (count) => Math.round((count / maxCount) * 100);

  const data = [
    {
      subject: '언론자유',
      [c1Name]: pf1 ? Math.round(pf1.score) : 50,
      [c2Name]: pf2 ? Math.round(pf2.score) : 50,
    },
    {
      subject: '부정 비율',
      [c1Name]: Number(dist1.negPct.toFixed(1)),
      [c2Name]: Number(dist2.negPct.toFixed(1)),
    },
    {
      subject: '기사 수',
      [c1Name]: normalizeCount(count1),
      [c2Name]: normalizeCount(count2),
    },
    {
      subject: '긍정 비율',
      [c1Name]: Number(dist1.posPct.toFixed(1)),
      [c2Name]: Number(dist2.posPct.toFixed(1)),
    },
  ];

  return (
    <div className="card p-5">
      <p className="section-label mb-2">종합 지표 비교</p>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke="#d4cfc5" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#8a8070' }} />
          <Radar name={c1Name} dataKey={c1Name} stroke="#c1440e" fill="#c1440e" fillOpacity={0.25} />
          <Radar name={c2Name} dataKey={c2Name} stroke="#1a2744" fill="#1a2744" fillOpacity={0.25} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'DM Sans' }} />
          <Tooltip contentStyle={{ background: '#f5f0e8', border: '1px solid #d4cfc5', fontSize: 11 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default OverviewRadarCompare;

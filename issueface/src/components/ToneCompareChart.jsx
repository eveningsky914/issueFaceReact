import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, ReferenceLine,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

function ToneCompareChart({ country1Name, country2Name, tone1, tone2 }) {
  const data = [
    { name: country1Name, tone: tone1 },
    { name: country2Name, tone: tone2 },
  ];

  return (
    <div className="card p-4">
      <p className="section-label mb-4">TONE 비교</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#8a8070' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[-5, 5]}
            tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#8a8070' }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine y={0} stroke="#d4cfc5" strokeWidth={1} />
          <Tooltip
            contentStyle={{
              background: '#f5f0e8',
              border: '1px solid #d4cfc5',
              borderRadius: 2,
              fontSize: 12,
              fontFamily: 'JetBrains Mono',
            }}
            formatter={(val) => [val > 0 ? `+${val}` : val, 'Tone']}
          />
          <Bar dataKey="tone" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={index === 0 ? '#c1440e' : '#1a2744'}
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ToneCompareChart;

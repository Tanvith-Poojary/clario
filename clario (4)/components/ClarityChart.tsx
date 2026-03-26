import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { User } from '../types';

interface ClarityChartProps {
  history: User['clarityHistory'];
}

const ClarityChart: React.FC<ClarityChartProps> = ({ history }) => {
  // Defensive copy
  let chartData = history && history.length > 0 ? [...history] : [{ date: 'Today', score: 50 }];

  // VISUAL FIX: If there is only one data point (e.g. Day 1), Recharts draws a dot or nothing.
  // We prepend a "Start" point at 50 to show a trend line relative to the baseline.
  if (chartData.length === 1) {
    chartData = [
        { date: 'Start', score: 50 }, 
        ...chartData
    ];
  }

  return (
    <div className="h-32 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            hide 
          />
          <YAxis 
            hide 
            domain={['dataMin - 5', 'dataMax + 5']} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#e2e8f0' }}
            itemStyle={{ color: '#10b981' }}
            cursor={false}
            labelFormatter={(label) => {
              if (label === 'Start' || label === 'Today') return label;
              try {
                const d = new Date(label);
                if (isNaN(d.getTime())) return label;
                // Since we are grouping by whole day (YYYY-MM-DD), just show the date
                return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              } catch (e) {
                return label;
              }
            }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorScore)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClarityChart;
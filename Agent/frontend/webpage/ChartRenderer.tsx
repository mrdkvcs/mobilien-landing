"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  graphId?: string;
  title?: string;
  description?: string;
  type?: 'bar' | 'line' | 'pie';
  data: any[];
  xAxis?: string;
  yAxis?: string;
  yAxisLabel?: string;
  color?: string;
}

export default function ChartRenderer({ chartData }: { chartData: ChartData | string }) {
  // Parse if string
  let data: ChartData | null = null;
  try {
    if (!chartData) {
      console.error('[ChartRenderer] No chart data provided');
      return <div className="text-red-500 text-sm">Nincs grafikonadat</div>;
    }
    
    data = typeof chartData === 'string' ? JSON.parse(chartData) : chartData;
    console.log('[ChartRenderer] Parsed data:', data);
    
    // Validate parsed data
    if (!data || typeof data !== 'object') {
      console.error('[ChartRenderer] Invalid chart data structure');
      return <div className="text-red-500 text-sm">Érvénytelen grafikonadat</div>;
    }
  } catch (error) {
    console.error('[ChartRenderer] Failed to parse chart data:', error);
    return <div className="text-red-500 text-sm">Hiba a grafikon betöltésekor</div>;
  }

  if (!data) {
    return <div className="text-red-500 text-sm">Nincs grafikonadat</div>;
  }

  const { title, description, type = 'bar', data: chartDataArray, xAxis = 'name', yAxis = 'value', yAxisLabel } = data;
  console.log('[ChartRenderer] chartDataArray:', chartDataArray);
  console.log('[ChartRenderer] xAxis:', xAxis, 'yAxis:', yAxis);
  
  // Validate data
  if (!chartDataArray || chartDataArray.length === 0) {
    console.error('[ChartRenderer] No data array found or empty');
    return <div className="text-orange-500 text-sm">Nincs adat a grafikonhoz</div>;
  }
  
  const barColor = data.color || '#009fa9';

  return (
    <div className="my-3" style={{ background: 'transparent', backgroundColor: 'transparent' }}>
      {title && (
        <h3 className="text-base text-white-900 mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-xs text-white-600 mb-2">{description}</p>
      )}

      <ResponsiveContainer width="100%" height={160} className="bg-transparent" style={{ background: 'transparent' }}>
        <BarChart 
          data={chartDataArray} 
          margin={{ top: 6, right: 6, left: 6, bottom: 6 }}
          style={{ background: 'transparent' }}
        >
          <XAxis dataKey={xAxis} tick={{ fontSize: 8, fill: '#d2d7dd' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 8, fill: '#d2d7dd' }} axisLine={false} tickLine={false} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fontSize: 8, fill: '#d2d7dd' } } : undefined} />
          <Tooltip 
            wrapperStyle={{ outline: 'none' }} 
            contentStyle={{ backgroundColor: 'rgba(22, 53, 53, 0.95)', border: '1px solidrgb(40, 41, 42)', borderRadius: 8, boxShadow: 'none' }} 
          />
          <Bar dataKey={yAxis} fill={barColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


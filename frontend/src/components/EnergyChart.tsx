export function EnergyChart() {
  return (
    <div className="chart-wrap" aria-label="Weekly energy trend chart">
      <div className="axis-label top">95</div>
      <div className="axis-label mid">60</div>
      <div className="axis-label low">25</div>
      <svg className="line-chart" viewBox="0 0 680 260" role="img" aria-labelledby="chart-title">
        <title id="chart-title">Energy recovery index line chart</title>
        <path className="gridline" d="M30 40h620M30 120h620M30 200h620" />
        <path
          className="area"
          d="M30 190 C90 160 120 140 170 148 C230 158 250 84 310 96 C360 106 400 72 445 82 C505 94 535 40 650 58 L650 230 L30 230 Z"
        />
        <path
          className="line gold-line"
          d="M30 190 C90 160 120 140 170 148 C230 158 250 84 310 96 C360 106 400 72 445 82 C505 94 535 40 650 58"
        />
        <path
          className="line red-line"
          d="M30 160 C90 170 125 188 178 176 C228 164 266 180 312 154 C374 119 410 136 460 118 C535 90 578 120 650 96"
        />
        <g className="points">
          <circle cx="310" cy="96" r="5" />
          <circle cx="445" cy="82" r="5" />
          <circle cx="650" cy="58" r="5" />
        </g>
      </svg>
    </div>
  );
}

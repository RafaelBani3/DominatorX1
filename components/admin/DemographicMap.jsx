"use client";

import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import geoData from "./indonesia.json";

// Helper to normalize province names for matching
const normalizeName = (name) => {
  if (!name) return "";
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  // some common mappings
  if (n.includes("jakarta")) return "jakartaraya";
  if (n.includes("yogyakarta")) return "yogyakarta";
  if (n.includes("papuabarat")) return "papuabarat";
  if (n.includes("bangkabelitung")) return "bangkabelitung";
  return n;
};

export default function DemographicMap({ data }) {
  const maxVal = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map((d) => d.value));
  }, [data]);

  const colorScale = (val) => {
    if (!val) return "#EEF1F7"; // base color
    const ratio = val / maxVal;
    // We will use a gradient from light purple to dark purple
    // #E5DEFF to #7C5CFC
    const light = { r: 229, g: 222, b: 255 };
    const dark = { r: 124, g: 92, b: 252 };
    
    const r = Math.round(light.r + (dark.r - light.r) * ratio);
    const g = Math.round(light.g + (dark.g - light.g) * ratio);
    const b = Math.round(light.b + (dark.b - light.b) * ratio);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const dataMap = useMemo(() => {
    const map = {};
    if (data) {
      data.forEach((d) => {
        map[normalizeName(d.name)] = d;
      });
    }
    return map;
  }, [data]);

  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  return (
    <div className="relative h-full w-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1000,
          center: [118, -2], // center of Indonesia
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoData}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const geoName = geo.properties.state || geo.properties.name || "";
              const normalized = normalizeName(geoName);
              const provinceData = dataMap[normalized];
              const val = provinceData?.value || 0;
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={colorScale(val)}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  onMouseEnter={(evt) => {
                    setTooltipData({ name: geoName, val });
                  }}
                  onMouseMove={(evt) => {
                    setTooltipPos({ x: evt.clientX, y: evt.clientY });
                  }}
                  onMouseLeave={() => {
                    setTooltipData(null);
                  }}
                  style={{
                    default: { outline: "none" },
                    hover: {
                      fill: provinceData ? "#6B4CEB" : "#D1D5DB",
                      outline: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      
      {tooltipData && (
        <div 
          className="pointer-events-none fixed z-50 rounded-xl border border-[#EEE8FF] bg-white px-3 py-2 text-xs shadow-xl text-[#1F2430]"
          style={{ 
            left: tooltipPos.x + 10, 
            top: tooltipPos.y + 10 
          }}
        >
          <p className="font-semibold">{tooltipData.name}</p>
          <p className="text-[#8A93A6]">
            Member: <span className="font-medium text-[#1F2430]">{tooltipData.val}</span>
          </p>
        </div>
      )}
      <div id="debug-datamap" className="absolute bottom-0 left-0 bg-black/80 text-white text-[10px] p-2 max-h-[150px] overflow-auto z-50">
        <pre>{JSON.stringify({
          data, 
          dataMapKeys: Object.keys(dataMap),
          geoMatched: geoData.features.map(g => normalizeName(g.properties.state || g.properties.name)).filter(n => dataMap[n])
        }, null, 2)}</pre>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Use the downloaded GeoJSON
const geoUrl = "/indonesia.geojson";

// Helper to normalize province names for matching
const normalizeName = (name) => {
  if (!name) return "";
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  // some common mappings
  if (n.includes("jakarta")) return "jakartaraya";
  if (n.includes("yogyakarta")) return "yogyakarta";
  if (n.includes("papuabarat")) return "papuabarat";
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

  return (
    <div className="relative h-full w-full">
      <TooltipProvider delayDuration={0}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 1000,
            center: [118, -2], // center of Indonesia
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoName = geo.properties.state || geo.properties.name || "";
                const normalized = normalizeName(geoName);
                const provinceData = dataMap[normalized];
                const val = provinceData?.value || 0;
                
                return (
                  <Tooltip key={geo.rsmKey}>
                    <TooltipTrigger asChild>
                      <Geography
                        geography={geo}
                        fill={colorScale(val)}
                        stroke="#FFFFFF"
                        strokeWidth={0.5}
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
                    </TooltipTrigger>
                    <TooltipContent className="rounded-xl border border-[#EEE8FF] bg-white px-3 py-2 text-xs shadow-xl text-[#1F2430]">
                      <p className="font-semibold">{geoName}</p>
                      <p className="text-[#8A93A6]">
                        Member: <span className="font-medium text-[#1F2430]">{val}</span>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </TooltipProvider>
    </div>
  );
}

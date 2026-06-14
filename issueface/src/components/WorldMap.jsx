import React, { memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { isSupportedCountry } from '../utils/supportedCountries';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const SELECTABLE_FILL = '#d4cfc5';
const DISABLED_FILL = '#e6e0d5';
const HOVER_FILL = '#b8b0a5';

// ISO numeric -> cca2 mapping (주요 국가)
const numericToCca2 = {
  "004":"AF","008":"AL","012":"DZ","024":"AO","032":"AR","036":"AU","040":"AT","050":"BD",
  "056":"BE","068":"BO","076":"BR","100":"BG","116":"KH","120":"CM","124":"CA","152":"CL",
  "156":"CN","170":"CO","188":"CR","191":"HR","192":"CU","203":"CZ","208":"DK","218":"EC",
  "818":"EG","231":"ET","246":"FI","250":"FR","276":"DE","288":"GH","300":"GR","320":"GT",
  "332":"HT","340":"HN","348":"HU","356":"IN","360":"ID","364":"IR","368":"IQ","372":"IE",
  "376":"IL","380":"IT","388":"JM","392":"JP","400":"JO","398":"KZ","404":"KE","408":"KP",
  "410":"KR","414":"KW","418":"LA","422":"LB","434":"LY","458":"MY","484":"MX","504":"MA",
  "508":"MZ","524":"NP","528":"NL","554":"NZ","558":"NI","566":"NG","578":"NO","586":"PK",
  "591":"PA","604":"PE","608":"PH","616":"PL","620":"PT","630":"PR","634":"QA","642":"RO",
  "643":"RU","682":"SA","686":"SN","694":"SL","706":"SO","710":"ZA","724":"ES","144":"LK",
  "729":"SD","752":"SE","756":"CH","760":"SY","764":"TH","792":"TR","800":"UG","804":"UA",
  "784":"AE","826":"GB","840":"US","858":"UY","860":"UZ","862":"VE","704":"VN","887":"YE",
  "894":"ZM","716":"ZW","051":"AM","031":"AZ","112":"BY","268":"GE","398":"KZ","440":"LT",
  "428":"LV","498":"MD","807":"MK","070":"BA","688":"RS","659":"KN","214":"DO",
};

function WorldMap({ country1, country2, onCountryClick }) {
  const getFill = (geo) => {
    const cca2 = numericToCca2[geo.id];
    if (!cca2) return DISABLED_FILL;
    if (cca2 === country1) return '#c1440e';
    if (cca2 === country2) return '#1a2744';
    if (!isSupportedCountry(cca2)) return DISABLED_FILL;
    return SELECTABLE_FILL;
  };

  const getHover = (geo) => {
    const cca2 = numericToCca2[geo.id];
    if (cca2 === country1 || cca2 === country2) return getFill(geo);
    if (!isSupportedCountry(cca2)) return DISABLED_FILL;
    return HOVER_FILL;
  };

  return (
    <div className="w-full h-full bg-parchment rounded-sm overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [10, 20] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={4}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const cca2 = numericToCca2[geo.id];
                const isSelectable = isSupportedCountry(cca2);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => isSelectable && onCountryClick(cca2)}
                    style={{
                      default: {
                        fill: getFill(geo),
                        stroke: '#f5f0e8',
                        strokeWidth: 0.4,
                        outline: 'none',
                      },
                      hover: {
                        fill: getHover(geo),
                        stroke: '#f5f0e8',
                        strokeWidth: 0.5,
                        outline: 'none',
                        cursor: isSelectable ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: getFill(geo),
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* 범례 */}
      <div className="absolute bottom-3 left-3 flex gap-3 text-xs font-mono bg-cream/80 backdrop-blur-sm px-3 py-1.5 rounded-sm border border-border">
        {country1 && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-accent inline-block" />
            {country1}
          </span>
        )}
        {country2 && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-navy inline-block" />
            {country2}
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(WorldMap);

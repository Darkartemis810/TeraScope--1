import React, { useState } from 'react';
import { Flame, Waves, Wind, Activity, MountainSnow, CloudLightning, ChevronDown, ChevronUp, CheckCircle, XCircle, Phone, Package } from 'lucide-react';

const DISASTER_DATA = {
  flood: {
    label: 'Flood', icon: Waves, color: 'text-blue-400', bg: 'bg-blue-500/15',
    dos: [
      'Move to higher ground immediately',
      'Avoid walking or driving through floodwaters',
      'Stay tuned to weather radio or local news',
      'Turn off utilities if instructed to do so',
      'Disconnect electrical appliances',
    ],
    donts: [
      'Don\'t walk through moving water (6 inches can knock you down)',
      'Don\'t drive into flooded areas',
      'Don\'t touch electrical equipment if wet',
      'Don\'t return home until authorities say it\'s safe',
    ],
    pack: ['Waterproof bag', 'Important documents (sealed)', 'Flashlight & batteries', 'First aid kit', 'Drinking water (1 gal/person/day)', 'Non-perishable food'],
    contacts: [{ name: 'Flood Hotline', number: '1-800-621-3362' }, { name: 'Local Emergency', number: '911' }],
  },
  earthquake: {
    label: 'Earthquake', icon: Activity, color: 'text-alert-red', bg: 'bg-alert-red/15',
    dos: [
      'DROP, COVER, and HOLD ON',
      'Stay indoors until shaking stops',
      'If outdoors, move to an open area away from buildings',
      'Check for injuries and provide first aid',
      'Expect aftershocks',
    ],
    donts: [
      'Don\'t run outside during shaking',
      'Don\'t stand near windows or heavy objects',
      'Don\'t use elevators',
      'Don\'t light matches or candles (gas leak risk)',
    ],
    pack: ['Sturdy shoes', 'Helmet or head protection', 'Whistle', 'Dust mask', 'First aid kit', 'Water & snacks'],
    contacts: [{ name: 'USGS Earthquake Info', number: '1-888-275-8747' }, { name: 'Emergency', number: '911' }],
  },
  fire: {
    label: 'Wildfire', icon: Flame, color: 'text-alert-orange', bg: 'bg-alert-orange/15',
    dos: [
      'Evacuate immediately if told to do so',
      'Close all windows and doors',
      'Wear protective clothing and N95 mask',
      'Keep car windows closed while evacuating',
      'Stay low if there is smoke',
    ],
    donts: [
      'Don\'t try to fight a wildfire yourself',
      'Don\'t leave windows or doors open',
      'Don\'t return to evacuated areas until cleared',
      'Don\'t ignore evacuation orders',
    ],
    pack: ['N95 masks', 'Important documents', 'Medications', 'Pet supplies', 'Phone charger', 'Change of clothes'],
    contacts: [{ name: 'Fire Department', number: '911' }, { name: 'Red Cross', number: '1-800-733-2767' }],
  },
  hurricane: {
    label: 'Hurricane', icon: Wind, color: 'text-gray-300', bg: 'bg-gray-400/15',
    dos: [
      'Board up windows and secure outdoor items',
      'Fill bathtubs and containers with clean water',
      'Move to an interior room during the storm',
      'Stay away from windows',
      'Keep emergency supplies accessible',
    ],
    donts: [
      'Don\'t go outside during the eye of the storm',
      'Don\'t use candles for lighting',
      'Don\'t ignore evacuation orders',
      'Don\'t wade through floodwaters after the storm',
    ],
    pack: ['Plywood/shutters for windows', 'Battery-powered radio', '3-day water supply', 'Canned food & can opener', 'Medications for 7 days', 'Cash (ATMs may be down)'],
    contacts: [{ name: 'FEMA Helpline', number: '1-800-621-3362' }, { name: 'Emergency', number: '911' }],
  },
};

const DisasterInfoCards = () => {
  const [selected, setSelected] = useState('flood');
  const [expanded, setExpanded] = useState({ dos: true, donts: true, pack: false });

  const data = DISASTER_DATA[selected];
  const Icon = data.icon;

  return (
    <div className="bg-graphite rounded-2xl p-5 border border-ghost/10">
      <h2 className="text-base font-sora font-semibold text-ghost mb-4 flex items-center gap-2">
        <Icon className={`w-5 h-5 ${data.color}`} /> Disaster Safety Guide
      </h2>

      {/* Disaster type selector */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {Object.entries(DISASTER_DATA).map(([key, d]) => {
          const DIcon = d.icon;
          return (
            <button key={key} onClick={() => setSelected(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${selected === key ? `${d.bg} ${d.color} border border-current/30` : 'bg-void text-ghost/40 border border-ghost/10 hover:border-ghost/20'}`}
              aria-pressed={selected === key}>
              <DIcon className="w-3.5 h-3.5" /> {d.label}
            </button>
          );
        })}
      </div>

      {/* DO's */}
      <div className="mb-3">
        <button onClick={() => setExpanded(p => ({ ...p, dos: !p.dos }))}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-alert-green/10 border border-alert-green/20 text-alert-green text-sm font-sora font-semibold">
          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> DO's</span>
          {expanded.dos ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expanded.dos && (
          <ul className="mt-2 space-y-1.5 pl-2">
            {data.dos.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-mono text-ghost/70">
                <CheckCircle className="w-3.5 h-3.5 text-alert-green shrink-0 mt-0.5" /> {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* DON'Ts */}
      <div className="mb-3">
        <button onClick={() => setExpanded(p => ({ ...p, donts: !p.donts }))}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-alert-red/10 border border-alert-red/20 text-alert-red text-sm font-sora font-semibold">
          <span className="flex items-center gap-2"><XCircle className="w-4 h-4" /> DON'Ts</span>
          {expanded.donts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expanded.donts && (
          <ul className="mt-2 space-y-1.5 pl-2">
            {data.donts.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-mono text-ghost/70">
                <XCircle className="w-3.5 h-3.5 text-alert-red shrink-0 mt-0.5" /> {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* What to Pack */}
      <div className="mb-3">
        <button onClick={() => setExpanded(p => ({ ...p, pack: !p.pack }))}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-plasma/10 border border-plasma/20 text-plasma text-sm font-sora font-semibold">
          <span className="flex items-center gap-2"><Package className="w-4 h-4" /> Emergency Pack</span>
          {expanded.pack ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expanded.pack && (
          <ul className="mt-2 space-y-1.5 pl-2">
            {data.pack.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-mono text-ghost/70">
                <Package className="w-3.5 h-3.5 text-plasma shrink-0 mt-0.5" /> {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="mt-4 flex gap-2 flex-wrap">
        {data.contacts.map((c, i) => (
          <a key={i} href={`tel:${c.number}`}
             className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-void border border-ghost/10 hover:border-plasma/30 text-sm font-mono text-ghost/70 hover:text-plasma transition-all">
            <Phone className="w-3.5 h-3.5" /> {c.name}: {c.number}
          </a>
        ))}
      </div>
    </div>
  );
};

export default DisasterInfoCards;

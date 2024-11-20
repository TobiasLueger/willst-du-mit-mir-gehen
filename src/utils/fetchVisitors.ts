interface VisitorHardware {
  screenInfo: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
    orientation: string;
  };
  gpu: {
    vendor: string;
    renderer: string;
  };
  memory: number;
  deviceMemory: number;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  hasTouchscreen: boolean;
  hasGamepad: boolean;
}

interface VisitorBrowserDetails {
  name: string;
  version: string;
  userAgent: string;
  platform: string;
  cookiesEnabled: boolean;
  doNotTrack: boolean;
  languages: string[];
}

interface VisitorCapabilities {
  webgl: boolean;
  webgl2: boolean;
  canvas: boolean;
  webrtc: boolean;
  audio: boolean;
  cookies: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  serviceWorker: boolean;
  webAssembly: boolean;
}

interface VisitorNetwork {
  type: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  effectiveType: string;
  online: boolean;
  pingTime: number;
  connectionQuality: string;
  estimatedSpeed: string;
}

interface VisitorLocation {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  isp: string;
  org: string;
}

export interface ValentineVisitor {
  timestamp: string;
  ipAddress: string;
  browser: string;
  os: string;
  deviceType: string;
  screenResolution: string;
  language: string;
  timezone: string;
  browserDetails: VisitorBrowserDetails;
  hardware: VisitorHardware;
  capabilities: VisitorCapabilities;
  network: VisitorNetwork;
  location: VisitorLocation;
}

export async function fetchValentineVisitors(): Promise<ValentineVisitor[]> {
  try {
    const pantryId = process.env.NEXT_PUBLIC_PANTRY_API_KEY;
    const basketName = 'valentine-visitors';

    if (!pantryId) {
      throw new Error('Pantry ID is not configured');
    }

    const response = await fetch(
      `https://getpantry.cloud/apiv1/pantry/${pantryId}/basket/${basketName}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.visitors || [];
  } catch (error) {
    console.error('Error fetching visitors:', error);
    return [];
  }
}

export function formatVisitorData(visitor: ValentineVisitor): string {
  try {
    // Ensure timestamp is a valid date string
    const timestamp = visitor.timestamp || new Date().toISOString();
    const date = new Date(timestamp);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      throw new Error('Invalid time value');
    }

    const formattedDate = new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);

    return `
Besuch am ${formattedDate}
------------------------------------------
📍 Ort: ${visitor.location?.city || 'Unbekannt'}, ${visitor.location?.region || 'Unbekannt'}, ${visitor.location?.country || 'Unbekannt'}
🌐 Browser: ${visitor.browser || 'Unbekannt'}
💻 Gerät: ${visitor.deviceType || 'Unbekannt'} (${visitor.os || 'Unbekannt'})
🖥️ Bildschirm: ${visitor.screenResolution || 'Unbekannt'}
🌍 Sprache: ${visitor.language || 'Unbekannt'}
⏰ Zeitzone: ${visitor.timezone || 'Unbekannt'}
🔌 ISP: ${visitor.location?.isp || 'Unbekannt'} (${visitor.location?.org || 'Unbekannt'})

📱 Hardware Details:
   • GPU: ${visitor.hardware?.gpu?.renderer || 'Unbekannt'}
   • RAM: ${visitor.hardware?.memory || 'Unbekannt'}GB
   • CPU Kerne: ${visitor.hardware?.hardwareConcurrency || 'Unbekannt'}
   • Touchscreen: ${visitor.hardware?.hasTouchscreen ? 'Ja' : 'Nein'}

🔌 Netzwerk:
   • Typ: ${(visitor.network?.effectiveType || 'UNKNOWN').toUpperCase()}
   • Qualität: ${visitor.network?.connectionQuality || 'Unbekannt'}
   • Ping: ${visitor.network?.pingTime || 'Unbekannt'}ms
   • Download: ${visitor.network?.downlink || 'Unbekannt'}Mbps

🛠️ Browser Features:
   • WebGL: ${visitor.capabilities?.webgl ? '✅' : '❌'}
   • WebRTC: ${visitor.capabilities?.webrtc ? '✅' : '❌'}
   • Service Worker: ${visitor.capabilities?.serviceWorker ? '✅' : '❌'}
   • Web Assembly: ${visitor.capabilities?.webAssembly ? '✅' : '❌'}
`;
  } catch (error) {
    console.error('Error formatting visitor data:', error);
    return 'Error: Could not format visitor data';
  }
}

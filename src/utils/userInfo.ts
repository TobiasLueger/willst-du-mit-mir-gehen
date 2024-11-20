// Typdefinitionen
interface NetworkInfo {
  type: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  effectiveType?: string;
  pingTime?: number;
  connectionQuality?: string;
  estimatedSpeed?: string;
  online: boolean;
}

interface LocationInfo {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  exact?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

interface BrowserDetails {
  name: string;
  version: string;
  userAgent: string;
  platform: string;
  cookiesEnabled: boolean;
  doNotTrack: boolean | null;
  languages: readonly string[];
}

interface HardwareInfo {
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
  memory?: number;
  deviceMemory?: number;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  hasTouchscreen: boolean;
  hasGamepad: boolean;
}

interface Capabilities {
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

export interface UserInfo {
  ipAddress: string;
  browser: string;
  os: string;
  deviceType: string;
  screenResolution: string;
  language: string;
  timezone: string;
  browserDetails: BrowserDetails;
  hardware: HardwareInfo;
  capabilities: Capabilities;
  network: NetworkInfo;
  location: LocationInfo;
}

const getExactLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation wird von diesem Browser nicht unterstützt'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
};

const getBasicNetworkInfo = (): NetworkInfo => {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  return {
    type: connection?.type || (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'cellular/wifi' : 'broadband'),
    downlink: connection?.downlink,
    rtt: connection?.rtt,
    saveData: connection?.saveData,
    effectiveType: connection?.effectiveType,
    online: navigator.onLine
  };
};

const getGPUInfo = (): { vendor: string; renderer: string; } => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return { vendor: 'Unbekannt', renderer: 'Unbekannt' };

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return { vendor: 'Unbekannt', renderer: 'Unbekannt' };

    return {
      vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unbekannt',
      renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unbekannt'
    };
  } catch {
    return { vendor: 'Unbekannt', renderer: 'Unbekannt' };
  }
};

const checkCapabilities = (): Capabilities => {
  return {
    webgl: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch { return false; }
    })(),
    webgl2: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
      } catch { return false; }
    })(),
    canvas: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('2d'));
      } catch { return false; }
    })(),
    webrtc: !!window.RTCPeerConnection,
    audio: !!(window.AudioContext || (window as any).webkitAudioContext),
    cookies: navigator.cookieEnabled,
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch { return false; }
    })(),
    sessionStorage: (() => {
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
      } catch { return false; }
    })(),
    serviceWorker: 'serviceWorker' in navigator,
    webAssembly: typeof WebAssembly === 'object'
  };
};

export const getUserInfo = async (): Promise<UserInfo> => {
  const ipResponse = await fetch('https://ipapi.co/json/');
  const ipData = await ipResponse.json() as {
    ip: string;
    city: string;
    region: string;
    country_name: string;
    country_code: string;
  };

  const ua = navigator.userAgent;
  const browserInfo = {
    chrome: /chrome/i.test(ua),
    safari: /safari/i.test(ua),
    firefox: /firefox/i.test(ua),
    opera: /opera/i.test(ua),
    ie: /msie/i.test(ua),
    edge: /edge/i.test(ua),
  };

  let browser = 'Unknown';
  if (browserInfo.edge) browser = 'Edge';
  else if (browserInfo.chrome) browser = 'Chrome';
  else if (browserInfo.firefox) browser = 'Firefox';
  else if (browserInfo.safari) browser = 'Safari';
  else if (browserInfo.opera) browser = 'Opera';
  else if (browserInfo.ie) browser = 'Internet Explorer';

  const version = ua.match(new RegExp(`${browser}\\/([\\d.]+)`)) || 
                 ua.match(/(?:rv:|it\/|ra\/|ie\/)([\\d.]+)/i) || ['', 'Unknown'];

  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';

  let deviceType = 'Unknown';
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
    deviceType = /iPad/i.test(ua) ? 'Tablet' : 'Smartphone';
  } else {
    deviceType = 'Desktop';
  }

  const screenResolution = `${window.screen.width}x${window.screen.height}`;
  const language = navigator.language || 'Unknown';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const userInfo: UserInfo = {
    ipAddress: ipData.ip,
    browser: `${browser} ${version[1]}`,
    os,
    deviceType,
    screenResolution,
    language,
    timezone,
    browserDetails: {
      name: browser,
      version: version[1],
      userAgent: ua,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes',
      languages: navigator.languages
    },
    hardware: {
      screenInfo: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        orientation: screen.orientation?.type || 'unknown'
      },
      gpu: getGPUInfo(),
      memory: (navigator as any).deviceMemory,
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      hasTouchscreen: 'ontouchstart' in window,
      hasGamepad: 'getGamepads' in navigator
    },
    capabilities: checkCapabilities(),
    network: getBasicNetworkInfo(),
    location: {
      city: ipData.city || 'Unbekannt',
      region: ipData.region || 'Unbekannt',
      country: ipData.country_name || 'Unbekannt',
      countryCode: ipData.country_code || 'XX'
    }
  };

  console.log(' Basis Besucher Information gesammelt');

  return userInfo;
};

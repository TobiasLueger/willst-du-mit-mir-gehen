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
  timestamp: string;
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

// NetworkConnection Interface für Navigator
interface NetworkInformation extends EventTarget {
  readonly effectiveType: string;
  readonly downlink: number;
  readonly rtt: number;
  readonly saveData: boolean;
  readonly type: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

interface WindowWithWebkit extends Window {
  webkitTemporaryStorage?: {
    queryUsageAndQuota(
      callback: (used: number, quota: number) => void
    ): void;
  };
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

export async function getUserInfo(): Promise<UserInfo> {
  const nav = navigator as NavigatorWithConnection & NavigatorWithMemory;
  const win = window as WindowWithWebkit;
  const screen = window.screen;

  // Get GPU information
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const gpuInfo = gl ? {
    vendor: (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).VENDOR),
    renderer: (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).RENDERER)
  } : {
    vendor: 'Unknown',
    renderer: 'Unknown'
  };

  // Get network information
  const connection = nav.connection;
  const startTime = performance.now();
  const pingResponse = await fetch('/api/ping').catch(() => null);
  const endTime = performance.now();
  const pingTime = Math.round(endTime - startTime);

  // Get browser details
  const userAgent = nav.userAgent;
  const browserInfo = {
    name: getBrowserName(userAgent),
    version: getBrowserVersion(userAgent),
    userAgent: userAgent,
    platform: nav.platform,
    cookiesEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack === '1' || nav.doNotTrack === 'yes',
    languages: nav.languages
  };

  // Get screen information
  const screenInfo = {
    width: screen.width,
    height: screen.height,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    orientation: screen.orientation?.type || 'unknown'
  };

  // Get capabilities
  const capabilities = {
    webgl: !!gl,
    webgl2: !!canvas.getContext('webgl2'),
    canvas: !!canvas.getContext('2d'),
    webrtc: !!window.RTCPeerConnection,
    audio: !!window.AudioContext || !!(window as any).webkitAudioContext,
    cookies: nav.cookieEnabled,
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    serviceWorker: 'serviceWorker' in navigator,
    webAssembly: typeof WebAssembly === 'object'
  };

  // Get network quality
  const networkQuality = getNetworkQuality(connection);

  // Get location info (this will be updated by the worker with actual data)
  const location = {
    city: 'Unknown',
    region: 'Unknown',
    country: 'Unknown',
    countryCode: 'Unknown'
  };

  return {
    timestamp: new Date().toISOString(),
    ipAddress: 'To be filled by worker',
    browser: `${browserInfo.name} ${browserInfo.version}`,
    os: getOS(userAgent),
    deviceType: getDeviceType(userAgent),
    screenResolution: `${screenInfo.width}x${screenInfo.height}`,
    language: nav.language || 'unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    browserDetails: browserInfo,
    hardware: {
      screenInfo,
      gpu: gpuInfo,
      memory: getTotalMemory(),
      deviceMemory: nav.deviceMemory || 0,
      hardwareConcurrency: nav.hardwareConcurrency || 0,
      maxTouchPoints: nav.maxTouchPoints || 0,
      hasTouchscreen: hasTouchScreen(),
      hasGamepad: 'getGamepads' in navigator
    },
    capabilities,
    network: {
      type: connection?.type || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false,
      effectiveType: connection?.effectiveType || 'unknown',
      online: navigator.onLine,
      pingTime: pingTime,
      connectionQuality: networkQuality.quality,
      estimatedSpeed: networkQuality.speed
    },
    location
  };
}

function getBrowserName(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}

function getBrowserVersion(userAgent: string): string {
  const match = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/(\d+\.\d+\.\d+\.\d+)/);
  return match ? match[2] : 'Unknown';
}

function getOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS X')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

function getDeviceType(userAgent: string): string {
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
}

function getTotalMemory(): number {
  const nav = navigator as NavigatorWithMemory;
  return nav.deviceMemory || 0;
}

function hasTouchScreen(): boolean {
  return (
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    ((navigator as any).msMaxTouchPoints > 0)
  );
}

function getNetworkQuality(connection?: NetworkInformation) {
  if (!connection) {
    return { quality: 'unknown', speed: 'unknown' };
  }

  let quality = 'unknown';
  let speed = 'unknown';

  if (connection.effectiveType === '4g' && connection.downlink > 5) {
    quality = 'good';
    speed = 'fast';
  } else if (connection.effectiveType === '4g') {
    quality = 'good';
    speed = 'medium';
  } else if (connection.effectiveType === '3g') {
    quality = 'fair';
    speed = 'slow';
  } else {
    quality = 'poor';
    speed = 'very-slow';
  }

  return { quality, speed };
}

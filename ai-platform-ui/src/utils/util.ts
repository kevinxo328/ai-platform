export function blobToFile(
  blob: Blob,
  fileName: string = new Date().toDateString() + new Date().toLocaleTimeString()
) {
  return new File(
    [blob as any], // cast as any
    fileName,
    {
      lastModified: new Date().getTime(),
      type: blob.type,
    }
  );
}

export function isValidURL(str: string) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return pattern.test(str);
}

export function getVideoPath(q: string) {
  return import.meta.env.PUBLIC_URL + `/videos/${q.replace("?", "")}`;
}

export function getUuid() {
  let d = Date.now();
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    d += performance.now(); //use high-precision timer if available
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getRandom(min: number, max: number) {
  return Math.round(Math.random() * (max - min));
}

export function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // Convert to Hex and ensure 2 digits
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
export function isEnglish(str: string) {
  const englishRegex = /^[a-zA-Z\s]*$/;
  return englishRegex.test(str);
}

// Make video background transparent by matting
export function makeBackgroundTransparent(
  timestamp: number,
  video: HTMLVideoElement,
  tmpCanvas: HTMLCanvasElement,
  canvas: HTMLCanvasElement,
  previousAnimationFrameTimestamp: number = 0
) {
  const tmpCanvasContext = tmpCanvas.getContext("2d", {
    willReadFrequently: true,
  }) as CanvasRenderingContext2D;
  tmpCanvasContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  if (video.videoWidth > 0) {
    let frame = tmpCanvasContext.getImageData(
      0,
      0,
      video.videoWidth,
      video.videoHeight
    );
    for (let i = 0; i < frame.data.length / 4; i++) {
      let r = frame.data[i * 4 + 0];
      let g = frame.data[i * 4 + 1];
      let b = frame.data[i * 4 + 2];

      if (g - 150 > r + b) {
        // Set alpha to 0 for pixels that are close to green
        frame.data[i * 4 + 3] = 0;
      } else if (g + g > r + b) {
        // Reduce green part of the green pixels to avoid green edge issue
        let adjustment = (g - (r + b) / 2) / 3;
        r += adjustment;
        g -= adjustment * 2;
        b += adjustment;
        frame.data[i * 4 + 0] = r;
        frame.data[i * 4 + 1] = g;
        frame.data[i * 4 + 2] = b;
        // Reduce alpha part for green pixels to make the edge smoother
        const a = Math.max(0, 255 - adjustment * 4);
        frame.data[i * 4 + 3] = a;
      }
    }

    const canvasContext = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvasContext.putImageData(frame, 0, 0);
  }

  window.requestAnimationFrame((timestamp) =>
    makeBackgroundTransparent(timestamp, video, tmpCanvas, canvas)
  );
}

export const htmlEncode = (text: string) => {
  const entityMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
  };

  return String(text).replace(/[&<>"']/g, (match) => entityMap[match]);
};

export const createSSML = (text: string, voice: string) => {
  return `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'><voice name='${voice}'><mstts:leadingsilence-exact value='0'/>${htmlEncode(
    text
  )}</voice></speak>`;
};

export function withBase(path: string) {
  const base = import.meta.env.BASE_URL;
  const normalizedBase =
    base && base !== "/" ? base.replace(/\/$/, "") : "";
  const normalizedPath =
    path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;

  if (!normalizedBase) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `${normalizedBase}/`;
  }

  return `${normalizedBase}${normalizedPath}`;
}

export function toPublicAsset(path: string) {
  return withBase(path);
}

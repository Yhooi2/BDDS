import { useEffect, type RefObject } from 'react'

interface ContainScaleConfig {
  designWidth: number
  designHeight: number
  mobileDesignWidth: number
  mobileDesignHeight: number
  mobileBreakpoint: number
}

const DEFAULT_CONFIG: ContainScaleConfig = {
  designWidth: 1280,
  designHeight: 720,
  mobileDesignWidth: 320,
  mobileDesignHeight: 1360,
  mobileBreakpoint: 768,
}

export function useContainScale(
  dashboardRef: RefObject<HTMLElement | null>,
  viewportRef: RefObject<HTMLElement | null>,
  config: Partial<ContainScaleConfig> = {}
): void {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  useEffect(() => {
    const dashboard = dashboardRef.current
    const viewport = viewportRef.current
    if (!dashboard || !viewport) return

    const applyScale = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const isMobile = vw < cfg.mobileBreakpoint

      const designW = isMobile ? cfg.mobileDesignWidth : cfg.designWidth
      const designH = isMobile ? cfg.mobileDesignHeight : cfg.designHeight

      const scaleX = vw / designW
      const scaleY = vh / designH

      // Desktop: contain (fit entirely), Mobile: scale by width (allow scroll)
      const scale = isMobile ? scaleX : Math.min(scaleX, scaleY)

      dashboard.style.transform = `scale(${scale})`

      const scaledW = designW * scale
      const scaledH = designH * scale
      viewport.style.width = `${scaledW}px`
      viewport.style.height = isMobile ? 'auto' : `${scaledH}px`
    }

    applyScale()

    let timeout: number
    const handleResize = () => {
      clearTimeout(timeout)
      timeout = window.setTimeout(applyScale, 50)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeout)
    }
  }, [
    dashboardRef,
    viewportRef,
    cfg.designWidth,
    cfg.designHeight,
    cfg.mobileDesignWidth,
    cfg.mobileDesignHeight,
    cfg.mobileBreakpoint,
  ])
}

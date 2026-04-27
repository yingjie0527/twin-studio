import { shallowRef, type Ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'

/**
 * Three.js 场景初始化和管理
 * 创建 Scene、Camera、Renderer、灯光、网格、轨道控制器和变换控制器
 */
export function useThreeScene(containerRef: Ref<HTMLDivElement | undefined>) {
  const scene = shallowRef<THREE.Scene | null>(null)
  const camera = shallowRef<THREE.PerspectiveCamera | null>(null)
  const renderer = shallowRef<THREE.WebGLRenderer | null>(null)
  const orbitControls = shallowRef<OrbitControls | null>(null)
  const transformControls = shallowRef<TransformControls | null>(null)
  const labelRenderer = shallowRef<CSS2DRenderer | null>(null)

  let animationFrameId: number | null = null
  let resizeHandler: (() => void) | null = null

  function init() {
    const container = containerRef.value
    if (!container) return

    // ---- Scene ----
    const sc = new THREE.Scene()
    sc.background = new THREE.Color('#0a0e1a')
    scene.value = sc

    // ---- Camera ----
    const aspect = container.clientWidth / container.clientHeight
    const cam = new THREE.PerspectiveCamera(50, aspect, 0.1, 2000)
    cam.position.set(8, 6, 8)
    cam.lookAt(0, 0, 0)
    camera.value = cam

    // ---- WebGL Renderer ----
    const r = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    r.setSize(container.clientWidth, container.clientHeight)
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    r.shadowMap.enabled = true
    r.shadowMap.type = THREE.PCFSoftShadowMap
    r.toneMapping = THREE.ACESFilmicToneMapping
    r.toneMappingExposure = 1.0
    r.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(r.domElement)
    renderer.value = r

    // ---- CSS2D Renderer (标签层) ----
    const lr = new CSS2DRenderer()
    lr.setSize(container.clientWidth, container.clientHeight)
    lr.domElement.style.position = 'absolute'
    lr.domElement.style.top = '0'
    lr.domElement.style.left = '0'
    lr.domElement.style.pointerEvents = 'none'
    container.appendChild(lr.domElement)
    labelRenderer.value = lr

    // ---- Lights ----
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    sc.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 100
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.bottom = -20
    directionalLight.shadow.bias = -0.0001
    sc.add(directionalLight)

    // ---- Grid ----
    const gridHelper = new THREE.GridHelper(100, 100, '#444444', '#333333')
    sc.add(gridHelper)

    // ---- OrbitControls ----
    const orbit = new OrbitControls(cam, r.domElement)
    orbit.enableDamping = true
    orbit.dampingFactor = 0.05
    orbit.minDistance = 1
    orbit.maxDistance = 500
    orbit.maxPolarAngle = Math.PI / 2
    orbitControls.value = orbit

    // ---- TransformControls ----
    const tc = new TransformControls(cam, r.domElement)
    tc.addEventListener('dragging-changed', (event: { value: boolean }) => {
      orbit.enabled = !event.value
    })
    sc.add(tc.getHelper())
    transformControls.value = tc

    // ---- Render Loop ----
    function animate() {
      animationFrameId = requestAnimationFrame(animate)
      orbit.update()
      r.render(sc, cam)
      lr.render(sc, cam)
    }
    animate()

    // ---- Resize ----
    function onResize() {
      const el = containerRef.value
      if (!el) return
      const w = el.clientWidth
      const h = el.clientHeight
      cam.aspect = w / h
      cam.updateProjectionMatrix()
      r.setSize(w, h)
      lr.setSize(w, h)
    }
    window.addEventListener('resize', onResize)
    resizeHandler = onResize
  }

  function dispose() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
      resizeHandler = null
    }

    transformControls.value?.dispose()
    orbitControls.value?.dispose()

    const container = containerRef.value
    if (container) {
      if (renderer.value) {
        container.removeChild(renderer.value.domElement)
      }
      if (labelRenderer.value) {
        container.removeChild(labelRenderer.value.domElement)
      }
    }

    renderer.value?.dispose()
    labelRenderer.value?.dispose?.()

    // 遍历场景释放几何体和材质
    if (scene.value) {
      scene.value.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose())
          } else {
            child.material?.dispose()
          }
        }
      })
    }

    scene.value = null
    camera.value = null
    renderer.value = null
    orbitControls.value = null
    transformControls.value = null
    labelRenderer.value = null
  }

  return {
    scene,
    camera,
    renderer,
    labelRenderer,
    orbitControls,
    transformControls,
    init,
    dispose,
  }
}

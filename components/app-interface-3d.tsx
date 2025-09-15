"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function AppInterface3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#f8f9fa")

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)

    // Responsive handling
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener("resize", handleResize)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Create smartphone
    const phoneWidth = 2
    const phoneHeight = 4
    const phoneDepth = 0.2

    // Phone body
    const phoneGeometry = new THREE.BoxGeometry(phoneWidth, phoneHeight, phoneDepth)
    const phoneMaterial = new THREE.MeshPhongMaterial({ color: 0x0c1d32 })
    const phone = new THREE.Mesh(phoneGeometry, phoneMaterial)
    scene.add(phone)

    // Phone screen
    const screenWidth = phoneWidth * 0.9
    const screenHeight = phoneHeight * 0.85
    const screenGeometry = new THREE.PlaneGeometry(screenWidth, screenHeight)

    // Create a canvas for the screen texture
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    canvas.width = 512
    canvas.height = 1024

    if (ctx) {
      // Background
      ctx.fillStyle = "#FFFBFC"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // App header
      ctx.fillStyle = "#007AAD"
      ctx.fillRect(0, 0, canvas.width, 100)

      // App title
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "bold 40px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Mobilien", canvas.width / 2, 60)

      // Map background
      ctx.fillStyle = "#D9E2E9"
      ctx.fillRect(20, 120, canvas.width - 40, 500)

      // Draw some charging stations on the map
      const stations = [
        { x: 100, y: 250 },
        { x: 200, y: 300 },
        { x: 300, y: 200 },
        { x: 400, y: 350 },
        { x: 150, y: 400 },
        { x: 350, y: 450 },
      ]

      stations.forEach((station) => {
        // Station marker
        ctx.fillStyle = "#007AAD"
        ctx.beginPath()
        ctx.arc(station.x, station.y, 15, 0, Math.PI * 2)
        ctx.fill()

        // Charging icon
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "bold 15px Arial"
        ctx.textAlign = "center"
        ctx.fillText("⚡", station.x, station.y + 5)
      })

      // Current location marker
      ctx.fillStyle = "#0C1D32"
      ctx.beginPath()
      ctx.arc(250, 300, 20, 0, Math.PI * 2)
      ctx.fill()

      // Location icon
      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.arc(250, 300, 10, 0, Math.PI * 2)
      ctx.fill()

      // Bottom navigation
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 650, canvas.width, 150)

      // Nav buttons
      const navItems = ["Map", "Search", "Profile", "Settings"]
      navItems.forEach((item, index) => {
        const x = (index + 0.5) * (canvas.width / navItems.length)

        // Icon placeholder
        ctx.fillStyle = "#007AAD"
        ctx.beginPath()
        ctx.arc(x, 700, 25, 0, Math.PI * 2)
        ctx.fill()

        // Label
        ctx.fillStyle = "#0C1D32"
        ctx.font = "24px Arial"
        ctx.textAlign = "center"
        ctx.fillText(item, x, 760)
      })

      // Status bar with battery, etc.
      ctx.fillStyle = "#0C1D32"
      ctx.font = "24px Arial"
      ctx.textAlign = "right"
      ctx.fillText("9:41 AM", canvas.width - 20, 950)

      // Battery icon
      ctx.strokeStyle = "#0C1D32"
      ctx.lineWidth = 2
      ctx.strokeRect(canvas.width - 80, 930, 50, 25)
      ctx.fillStyle = "#0C1D32"
      ctx.fillRect(canvas.width - 75, 935, 40, 15)
    }

    // Create texture from canvas
    const screenTexture = new THREE.CanvasTexture(canvas)
    const screenMaterial = new THREE.MeshBasicMaterial({ map: screenTexture })
    const screen = new THREE.Mesh(screenGeometry, screenMaterial)
    screen.position.z = phoneDepth / 2 + 0.01
    scene.add(screen)

    // Home button
    const homeButtonGeometry = new THREE.CircleGeometry(0.2, 32)
    const homeButtonMaterial = new THREE.MeshPhongMaterial({ color: 0xd9e2e9 })
    const homeButton = new THREE.Mesh(homeButtonGeometry, homeButtonMaterial)
    homeButton.position.set(0, -phoneHeight / 2 + 0.4, phoneDepth / 2 + 0.01)
    scene.add(homeButton)

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)

      // Gentle floating animation
      phone.position.y = Math.sin(Date.now() * 0.001) * 0.1
      phone.rotation.y = Math.sin(Date.now() * 0.0005) * 0.2

      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
      // Dispose of geometries and materials
      ;[phoneGeometry, screenGeometry, homeButtonGeometry].forEach((geometry) => geometry.dispose())
      ;[phoneMaterial, screenMaterial, homeButtonMaterial].forEach((material) => material.dispose())
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}


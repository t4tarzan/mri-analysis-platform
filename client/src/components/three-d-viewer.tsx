import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";
import * as THREE from "three";

export default function ThreeDViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const brainRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
    camera.position.set(0, 0, 4);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 384);
    renderer.setClearColor(0xf8fafc);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create brain model
    const brainGroup = new THREE.Group();
    brainRef.current = brainGroup;

    // Brain main structure (ellipsoid)
    const brainGeometry = new THREE.SphereGeometry(1.2, 32, 24);
    brainGeometry.scale(1, 0.9, 1.1);
    const brainMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x8b5cf6, 
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
    brainGroup.add(brainMesh);

    // Brain hemispheres division
    const leftHemisphere = new THREE.SphereGeometry(1.2, 32, 24, 0, Math.PI);
    leftHemisphere.scale(1, 0.9, 1.1);
    const leftMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, 
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const leftMesh = new THREE.Mesh(leftHemisphere, leftMaterial);
    brainGroup.add(leftMesh);

    const rightHemisphere = new THREE.SphereGeometry(1.2, 32, 24, Math.PI, Math.PI);
    rightHemisphere.scale(1, 0.9, 1.1);
    const rightMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xf59e0b, 
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const rightMesh = new THREE.Mesh(rightHemisphere, rightMaterial);
    brainGroup.add(rightMesh);

    // Brain stem
    const stemGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.8, 12);
    const stemMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xe11d48, 
      wireframe: true,
      opacity: 0.8
    });
    const stemMesh = new THREE.Mesh(stemGeometry, stemMaterial);
    stemMesh.position.set(0, -1.2, 0);
    brainGroup.add(stemMesh);

    // Cerebellum
    const cerebellumGeometry = new THREE.SphereGeometry(0.4, 16, 12);
    const cerebellumMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x10b981, 
      wireframe: true,
      opacity: 0.7
    });
    const cerebellumMesh = new THREE.Mesh(cerebellumGeometry, cerebellumMaterial);
    cerebellumMesh.position.set(0, -0.8, -0.9);
    brainGroup.add(cerebellumMesh);

    // Add detection points (simulated anomalies)
    const pointGeometry = new THREE.SphereGeometry(0.05, 8, 6);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    // Aneurysm point
    const aneurysmPoint = new THREE.Mesh(pointGeometry, pointMaterial);
    aneurysmPoint.position.set(0.7, 0.3, 0.4);
    brainGroup.add(aneurysmPoint);

    // Anomaly point
    const anomalyMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b00 });
    const anomalyPoint = new THREE.Mesh(pointGeometry, anomalyMaterial);
    anomalyPoint.position.set(-0.5, 0.2, 0.6);
    brainGroup.add(anomalyPoint);

    // Grid plane
    const gridHelper = new THREE.GridHelper(4, 20, 0x888888, 0xcccccc);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Axis helper
    const axesHelper = new THREE.AxesHelper(1);
    axesHelper.position.set(-1.5, -1.5, 0);
    scene.add(axesHelper);

    scene.add(brainGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (isRotating && brainRef.current) {
        brainRef.current.rotation.y += 0.01;
        brainRef.current.rotation.x += 0.005;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isRotating]);

  const handleResetView = () => {
    if (cameraRef.current && brainRef.current) {
      cameraRef.current.position.set(0, 0, 4);
      brainRef.current.rotation.set(0, 0, 0);
    }
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.9);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.1);
    }
  };

  const handleToggleRotation = () => {
    setIsRotating(!isRotating);
  };

  return (
    <Card className="relative bg-gradient-to-br from-muted/30 to-muted/50 rounded-lg overflow-hidden">
      <div className="h-96 relative" data-testid="three-d-viewer">
        <div 
          ref={mountRef} 
          className="w-full h-full"
          style={{ minHeight: '384px' }}
        />
        
        {/* 3D Controls Overlay */}
        <div className="absolute top-4 right-4 space-y-2">
          <Button
            variant="secondary"
            size="sm"
            className="w-10 h-10 p-0 bg-card border border-border hover:bg-muted/50"
            onClick={handleZoomIn}
            data-testid="button-zoom-in"
          >
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-10 h-10 p-0 bg-card border border-border hover:bg-muted/50"
            onClick={handleZoomOut}
            data-testid="button-zoom-out"
          >
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className={`w-10 h-10 p-0 bg-card border border-border hover:bg-muted/50 ${
              isRotating ? 'bg-primary/10' : ''
            }`}
            onClick={handleToggleRotation}
            data-testid="button-rotate"
          >
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-10 h-10 p-0 bg-card border border-border hover:bg-muted/50"
            onClick={handleResetView}
            data-testid="button-reset-view"
          >
            <Maximize2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-red-500"></div>
            <span>Aneurysm (87%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-orange-500"></div>
            <span>Anomaly (73%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-blue-500"></div>
            <span>Left Hemisphere</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-yellow-500"></div>
            <span>Right Hemisphere</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
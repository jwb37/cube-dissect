const background_colour = 0x88AA88

const CameraDistanceSnake = 8;
const CameraOffsetSolution = new THREE.Vector3(2.5, 4, 5);

/*
    We need two slightly different setups for the two visualizers.
    Inheritance in Javascript seems to be a mess, so I opted for passing the type into the constructor isntead. Ugly, but there you go!
*/

var VisType = {
    Snake: 1,
    Solution: 2
};


function ThreeVisualizer(container, type) {
    var that=this;

    var scene;
    var camera;
    var controls;
    var renderer;

    var object;

    var geometry = new Geometry3D();
    var cube_geometry = new THREE.BoxGeometry(1,1,1);
    var cube_texture;
    var cube_material;
    var cube_highlight_material;

    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color( background_colour );

        renderer = new THREE.WebGLRenderer( {antialias: true} );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( container.clientWidth, container.clientHeight );
        container.appendChild( renderer.domElement );

        camera = new THREE.PerspectiveCamera( 60, container.clientWidth / container.clientHeight, 1, 1000 );
        if( type==VisType.Snake ) {
            camera.position.set( 0, 0, CameraDistanceSnake );
            camera.up.set(0,1,0);
        } else if( type==VisType.Solution ) {
            camera.position.set( 0, 0, 0 );
            camera.position.add( CameraOffsetSolution );
        }

        controls = new THREE.OrbitControls( camera, renderer.domElement );
        controls.target.set(0, 0, 0);

        cube_texture = new THREE.TextureLoader().load(ImageData.cube_texture);

        cube_material = new THREE.MeshPhongMaterial(
            {
                color:			0xFFFFFF,
                emissive:		0x303020,
                map:			cube_texture
            }
        );

        cube_highlight_material = new THREE.MeshPhongMaterial(
            {
                color:			0xFFFFFF,
                emissive:       0xAA2020,
                map:			cube_texture
            }
        );


        let light_source = new THREE.DirectionalLight();
        light_source.position.set(-1,0,20);
        scene.add(light_source);

        /*
            Illuminate on all sides for the solution view!
        */
        if( type==VisType.Solution ) {
            light_source = new THREE.DirectionalLight();
            light_source.position.set(-4,10,-20);
            scene.add(light_source);

            light_source = new THREE.DirectionalLight();
            light_source.position.set(4,-10,-1);
            scene.add(light_source);
        }


        if( type==VisType.Snake ) {
            controls.enableRotate = false;
            controls.enablePan = true;
            controls.mouseButtons.ORBIT = null;
            controls.mouseButtons.PAN = THREE.MOUSE.LEFT;
        }
    }

    this.on_resize = function() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( container.clientWidth, container.clientHeight );
    }

    this.create_snake = function(snake, directions, max_step, highlight_last=false) {
        if (object) {
            scene.remove(object);
        }

        object = new THREE.Group();

        let step;
        let cur_pos = new THREE.Vector3(0,0,0);

        function add_cube() {
            let material = cube_material;
            if (step==max_step-1 && highlight_last) {
                material = cube_highlight_material;
            }
            let cube = new THREE.Mesh( cube_geometry, material );
            cube.position.add(cur_pos);
            object.add(cube);
        }

        add_cube();

        for(step=0; step<max_step; step++) {
            for(let i=1; i<snake[step]; i++ ) {
                cur_pos.add(directions[step].UnitVector);
                add_cube();
            }
        }

        scene.add(object);

        let bbox = new THREE.Box3().setFromObject(object);
        let centre = bbox.getCenter();
        object.position.set( -centre.x, -centre.y, -centre.z );

        if( type == VisType.Snake ) {
            // Bit of a hack this - it proved easier to rotate the camera than rotate the object!
            controls.object.up.set( -bbox.max.y, bbox.max.x, 0 );
            controls.update();
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    init();
    animate();
}

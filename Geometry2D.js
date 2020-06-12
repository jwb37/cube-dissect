/*
    I did think about using Vector2 here, but for the visualizations it seems easier
    to work in 3D space from the start, rather than having to write separate code
    to embed the 2D results into 3D space.
*/
function Geometry2D() {
    this.Name = "2D";

    this.Zero = new THREE.Vector3(0,0,0);

    this.Left = {
        UnitVector: new THREE.Vector3(-1,0,0),
        Dimension: 0,
        Name: "Left"
    };
    this.Right = {
        UnitVector: new THREE.Vector3(1,0,0),
        Dimension: 0,
        Name: "Right"
    };
    this.Down = {
        UnitVector: new THREE.Vector3(0,-1,0),
        Dimension: 1,
        Name: "Down"
    };
    this.Up = {
        UnitVector: new THREE.Vector3(0,1,0),
        Dimension: 1,
        Name: "Up"
    };

    this.Directions = [
        this.Left,
        this.Right,
        this.Down,
        this.Up
    ];

    this.OppositePairs = [
        [this.Left, this.Right],
        [this.Up, this.Down],
    ];

    /*
        Give each direction an "Opposite" property, pointing to the opposite direction.
        Give each direction a "Perpendiculars" property: an array containing perpendicular directions
    */
    for(let pair of this.OppositePairs) {
        [pair[0].Opposite, pair[1].Opposite] = [pair[1], pair[0]];

        let remaining_directions = this.Directions.filter(dir => !pair.includes(dir));
        pair[0].Perpendiculars = remaining_directions;
        pair[1].Perpendiculars = remaining_directions;
    }


    /*
        Finds the centre of the given bounding box
    */
    this.centre = function(bbox) {
        return new THREE.Vector3(
            (bbox[this.Right.Name] - bbox[this.Left.Name]) / 2,
            (bbox[this.Up.Name] - bbox[this.Down.Name]) / 2,
            0
        )
    }

    // Sadly seems to be needed to overcome Javascript's ability to compare objects in a Set
    // Provide our own hashable form of a vector.
    this.vector_to_string = function(vec) {
        return `(${vec.x},${vec.y},${vec.z})`;
    }
}

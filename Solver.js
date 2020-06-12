function Solver(snake, geometry) {
    var that = this;

    var cube_size;
    this.starting_axes = [geometry.Left, geometry.Up];

    function solve_step(layer, pos, direction, bbox, filled_spaces) {
        if(layer >= snake.length) {
            return [true, [direction]]
        }

        for(let new_direction of direction.Perpendiculars) {
            // Create copies of relevant data structures
            let new_filled_spaces = new Set(filled_spaces);
            let new_bbox = Object.assign({}, bbox);
            let new_pos = pos.clone();

            // First Check: Would the new position clash with an existing block?
            let check_valid = true;
            for(let i=0; i<snake[layer]-1; i++ ) {
                new_pos.add(new_direction.UnitVector);
                if( filled_spaces.has(geometry.vector_to_string(new_pos)) ) {
                    check_valid = false;
                }
                new_filled_spaces.add(
                    geometry.vector_to_string(new_pos)
                );
            }
            
            if(!check_valid) {
                // Failed check. On to the next possible direction!
                continue;
            }

            // Second Check: With the new position, does the folded snake fit within the target cube?
            let new_coord = new_pos.getComponent(new_direction.Dimension);
            let new_direction_coord = new_direction.UnitVector.getComponent(new_direction.Dimension)
            let direction_to_update;

            if( Math.sign(new_coord) == Math.sign(new_direction_coord) ) {
                direction_to_update = new_direction;
            } else {
                direction_to_update = new_direction.Opposite;
            }
            new_bbox[direction_to_update.Name] = Math.max(
                new_bbox[direction_to_update.Name],
                Math.abs(new_coord) + 0.5
            );

            if( new_bbox[new_direction.Name] + new_bbox[new_direction.Opposite.Name] > cube_size ) {
                // Failed check. On to the next possible direction
                continue;
            }

            let success;
            let solution_array;
            let solved_bbox;
            [success, solution_array] = solve_step(layer+1, new_pos, new_direction, new_bbox, new_filled_spaces);

            if (success) {
                return [true, [direction, ...solution_array]];
            }
        }
        // No legal way of placing next set of blocks. We've reached a dead end.
        return [false, []];
    }

    this.solve = function(_cube_size_) {
        // Algorithm below assumes snake is at least of size 2.
        // So first of all handle exceptional cases.
        if( snake.length < 1 ) {
            return [false, []];
        } else if( snake.length == 1 ) {
            if( snake[0] > _cube_size_ ) {
                return [false, []];
            } else {
                return [true, [this.starting_axes[0]]];
            }
        }

        // Now, onto the actual algorithm
        cube_size = _cube_size_

        let bbox = {}

        for(let dir of geometry.Directions) {
            bbox[dir.Name] = 0.5;
        }

        let starting_pos = geometry.Zero.clone();
        let filled_spaces = new Set(
            [geometry.vector_to_string(starting_pos)]
        );

        this.starting_axes.forEach( function(axis, step) {
            let length = snake[step] - 1;
            bbox[axis.Name] += length;
            for(let i=0; i<length; i++) {
                starting_pos.add(axis.UnitVector);
                filled_spaces.add(
                    geometry.vector_to_string(starting_pos)
                );
            }
        });

        let success;
        let solution_array;

        [success, solution_array] = solve_step(2, starting_pos, this.starting_axes[1], bbox, filled_spaces);

        if(success) {
            return [true, [this.starting_axes[0],...solution_array]];
        } else {
            return [false, []];
        }
    }
}

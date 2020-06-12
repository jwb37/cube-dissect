function App() {
    var that = this;
    var geometry = new Geometry3D();
    var text_output = document.getElementById("solution_text_output");
    var snake = document.getElementById("snake_text_input").value;

    var snake_visualizer;
    var solution_visualizer;

    this.snake_regexp = "\d+(?:[,\s]+\d+)*";

    var solution_array = [];
    var solution_step = -2;

    function setup_callbacks() {
        document.getElementById("snake_solve_btn").addEventListener("click", on_solve_click);
        document.getElementById("geometry_selector").addEventListener("change", on_geometry_select);
        document.getElementById("snake_text_input").addEventListener("input", on_snake_text_change);
        document.getElementById("solution_text_output").addEventListener("change", function(event) {
            on_solution_step_change(parseInt(event.target.value));
        } );
        document.getElementById("reset_button").addEventListener("click", function(event) {
            on_solution_step_change(0);
            text_output.options[0].selected = 'selected';
        } );
        document.getElementById("step_back_button").addEventListener("click", function(event) {
            if( solution_step > 0 ) {
                on_solution_step_change(solution_step-1);
                text_output.options[solution_step].selected = 'selected';
            }
        } );
        document.getElementById("step_forward_button").addEventListener("click", function(event) {
            if( solution_step < solution_array.length-1 ) {
                on_solution_step_change(solution_step+1);
                text_output.options[solution_step].selected = 'selected';
            }
        } );

        window.addEventListener("resize", function(){
            snake_visualizer.on_resize(),
            solution_visualizer.on_resize()
        } );
    }

    function create_visualizers() {
        snake_visualizer = new ThreeVisualizer(
            document.getElementById("snake_visualization"),
            VisType.Snake
        );
        solution_visualizer = new ThreeVisualizer(
            document.getElementById("solution_visualization"),
            VisType.Solution
        );
    }

    function update_snake_visualization() {
        directions = [];
        for(let i=0; i<snake.length; i++ ) {
            if( i%2 == 0 ) {
                directions.push(geometry.Right);
            } else {
                directions.push(geometry.Up);
            }
        }

        snake_visualizer.create_snake(snake, directions, snake.length);
    }

    function clear_text_output() {
        while( text_output.hasChildNodes() ) {
            text_output.removeChild( text_output.lastChild );
        }
    }

    function write_text_output(success) {
        let option_group = document.createElement("optgroup");

        if(success) {
            option_group.setAttribute("label", "Solution found:");
            
            for(let i=0; i<solution_array.length; i++) {
                let new_option = document.createElement("option");
                new_option.setAttribute("value", i);
                new_option.textContent = `${snake[i]} blocks in direction ${solution_array[i].Name}`;
                option_group.appendChild(new_option);

                // Automatically select final option
                if( i == solution_array.length-1 ) {
                    new_option.selected = 'selected';
                    solution_step = i;
                }
            }
        }
        else {
            option_group.setAttribute("label", "No solution found");
        }

        text_output.appendChild(option_group);
    }

    function on_snake_text_change() {
        let snake_text_input = document.getElementById('snake_text_input');
        if( !snake_text_input.reportValidity() ) {
            return;
        }
        snake = snake_text_input.value.split(/[,\s]+/);
        update_snake_visualization();
    }


    function on_geometry_select(event) {
        switch(event.target.value) {
            case("2D"): geometry = new Geometry2D(); break;
            case("3D"): geometry = new Geometry3D(); break;
        }
    }

    function on_solve_click() {
        let cube_size = document.getElementById("cube_size_spin").value;

        let solver = new Solver(snake, geometry);

        let success;
        [success, solution_array] = solver.solve(cube_size);

        clear_text_output();
        write_text_output(success);

        if(success) {
            solution_visualizer.create_snake(snake, solution_array, snake.length, true);
        }
    }

    function on_solution_step_change(step_number) {
        // No solution/snake available
        if( solution_array.length <= 0 || snake.length <= 0 ) {
            return;
        }

        if( step_number < 0 || step_number > snake.length || step_number > solution_array.length ) {
            console.debug( "Warning: user was able to ask for more steps to be drawn than exist in the solution!" );
            return;
        }

        solution_step = step_number;
        solution_visualizer.create_snake(snake, solution_array, step_number+1, true);
    }

    create_visualizers();
    setup_callbacks();
    on_snake_text_change();
}

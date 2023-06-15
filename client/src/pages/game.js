import React, {Component} from 'react';
import EndSketch from './endSketch';
import Players from './players';
import Sketch from './sketch';
import { socket } from '../socket';

class Game extends Component{
    constructor(props)
    {
        super(props);
        this.state = {
            username: this.props.username,
            gameOver: false,
        }
    }

    componentDidMount()
    {
        socket.on("endGame", (data) => {
            this.setState({
                gameOver: true,
                baseStrings: data
            })
        });
    }

    render()
    {
        if(this.state.gameOver)
        {
            return (
                <EndSketch baseStrings={this.state.baseStrings}></EndSketch>
            )
        }
        return (
            <div style={{
                background: "var(--bg1)",
                display: "flex",
                height: "100%",//'100vh',
                width: '100vw',
                
            }}>
                <Sketch username={this.state.username}></Sketch>
                <Players username={this.state.username}></Players>
            </div>
        );
    }
}

export default Game;
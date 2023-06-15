import React, {Component} from 'react';
import { socket } from '../socket';
import p5 from 'p5';
import { isMobile } from 'react-device-detect';

class Sketch extends Component{
    constructor(props)
    {
        super(props);
        this.state = {
            username: this.props.username,
            // active: true,
            brushSize: 5,
            mode: 1,
            scale: Math.min( (window.innerWidth-20)/500 , (window.innerHeight-20)/500 ,1)
        }
        this.myRef = React.createRef();
        this.paintMode = this.paintMode.bind(this);
        this.eraseMode = this.eraseMode.bind(this);
        this.reset = this.reset.bind(this);
        this.sendSketch = this.sendSketch.bind(this);
        this.submit = this.submit.bind(this);
        this.clue = null;
        this.sendTo = null;
    }

    componentDidMount()
    {
        if(this.sketch)
        {
            this.sketch.remove();
        }

        this.sketch = new p5( p  => {
            
            p.setup = () => {
                // let height = window.innerHeight*(isMobile?1.2:1);
                this.canvas = p.createCanvas(500,500).parent(this.myRef.current);
                p.background('#ffffff');
                
            };

            p.draw = () => {
                if (p.mouseIsPressed && this.state.active) {
                    p.stroke(this.state.mode?"#000000":"#ffffff");
                    p.strokeWeight(this.state.brushSize*this.state.brushSize);
                    let sc = this.state.scale;
                    p.line(p.mouseX/sc, p.mouseY/sc, p.pmouseX/sc, p.pmouseY/sc);
                }
            }

            socket.on("receiveSketch", (data) => {
                p.loadImage(data.clue, (img) => {
                    this.clue = img;
                    p.background(255);
                    p.image(img,0,0);
                    console.log(data.from);
                });
            })
        });

        socket.on("receiveActive", (name) => {
            if(name == this.state.username)
            {
                this.setState({
                    active: true
                });
            }
            else
            {
                this.setState({
                    active: false
                });
            }
        });

        window.addEventListener('sendTo', (e)=>{
            // console.log(e.detail);
            this.sendTo = e.detail;
            this.sendSketch()
        });
    }

    sendSketch()
    {
        if(this.canvas)
        {
            //full canvas
            let fullCanvasData = (this.canvas.elt.toDataURL());

            var hidden_canv = document.createElement('canvas');
            hidden_canv.style.display = 'none';
            document.body.appendChild(hidden_canv);
            hidden_canv.width = 500;
            hidden_canv.height = 75;

            var hidden_ctx = hidden_canv.getContext('2d');
            hidden_ctx.drawImage(
                this.canvas.elt, 
                0,//Start Clipping
                425,//Start Clipping
                500,//Clipping Width
                75,//Clipping Height
                0,//Place X
                0,//Place Y
                hidden_canv.width,//Place Width
                hidden_canv.height//Place Height
            );

            let clueCanvasData = (hidden_canv.toDataURL());
            // socket.emit("dummySendSketch", clueCanvasData);
            socket.emit("sendSketch", {
                from: this.state.username,
                to: this.sendTo,
                clueCnvs: clueCanvasData,
                cnvs: fullCanvasData
            });
        }
    }

    paintMode()
    {
        this.setState({
            mode: 1
        });
    }

    eraseMode()
    {
        this.setState({
            mode: 0
        });
    }

    reset()
    {
        if(this.sketch)
        {
            this.sketch.background(255);
            if(this.clue)
            {
                this.sketch.image(this.clue,0,0);
            }
        }
    }

    submit()
    {
        if(this.canvas)
        {
            let fullCanvasData = (this.canvas.elt.toDataURL());
            socket.emit("endGame", {
                from: this.state.username,
                to: this.sendTo,
                cnvs: fullCanvasData
            });
        }
        // console.log(fullCanvasData);
    }
    
    render()
    {
        let guard = (<div style={{
            position: "absolute",
            background: "var(--blur1)",
            height: "100%",
            width: "100%",
            backdropFilter: "blur(10px)",
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            opacity: 1
        }}>
            WAIT FOR YOUR TURN...
        </div>);
        return (
            <div 
            style={{
                display: "flex",
                flexDirection: isMobile?"column":"row",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                width: "100vw"
            }}>

                <div 
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: "scale(" + this.state.scale +")"
                }}
                ref={this.myRef}>
                </div>
                
                <div 
                className='brushOptions'
                style={{
                    // background: "rgba(0,0,0,0.5)",
                    justifySelf: "flex-end",
                    float: "right",
                    height: isMobile?"auto":"100vh",
                    flexDirection: isMobile?"row":"column",
                    flexWrap: "wrap",
                    display: "flex",
                    justifyContent: isMobile?"space-evenly":"center",
                    alignItems: "center",
                    margin: "0.1em"
                }}>
                    <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    className='slider'
                    onChange={(e) => this.setState({ brushSize: e.target.value})}
                    value={this.state.brushSize}></input>
                    <button 
                        style={{
                        width: isMobile?"auto":"90%",
                        background: this.state.mode?"var(--bg3)":"var(--bg2)"
                        }}
                        onClick={this.paintMode}>
                        Paint
                    </button>
                    <button 
                        style={{
                        width: isMobile?"auto":"90%",
                        background: this.state.mode?"var(--bg2)":"var(--bg3)"
                        }}
                        onClick={this.eraseMode}>
                        Erase
                    </button>
                    <button 
                        style={{
                        width: isMobile?"auto":"90%",
                        background: "var(--bg2)"
                        }}
                        onClick={this.reset}>
                        Reset
                    </button>
                    <button 
                        style={{
                        width: isMobile?"auto":"90%",
                        background: "var(--bg2)"
                        }}
                        onClick={this.submit}>
                        End Game
                    </button>
                </div>

                {this.state.active?<></>:guard}

            </div>
        );
    }
}

export default Sketch;
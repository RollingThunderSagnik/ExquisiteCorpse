import React, {Component} from 'react';
import { socket } from '../socket';
import p5 from 'p5';

class EndSketch extends Component{
    constructor(props)
    {
        super(props);
        this.state = {
            username: this.props.username,
            baseStrings: this.props.baseStrings,
            scale: 1
        }
        this.myRef = React.createRef();
        this.makeImage = this.makeImage.bind(this);
    }

    componentDidMount()
    {
        console.log(this.state.baseStrings);
        if(this.sketch)
        {
            this.sketch.remove();
        }

        this.sketch = new p5( p  => {
            const imageLoader = (url) => {
                return new Promise( (resolve, reject) => {
                    p.loadImage(url, 
                        (result) => {
                            resolve(result);        
                        }, 
                        () => {
                            reject(Error("Image not found"))
                        });

                });
            };
            
            p.setup = async () => {
                let lngth = Object.keys(this.state.baseStrings).length;//this.state.baseStrings.length;
                p.pixelDensity(1);
                this.canvas = p.createCanvas(500,425*lngth + 75).parent(this.myRef.current);
                p.background('#ffffff');
                for(let i=0;i<lngth;i++)
                {
                    let img  = await imageLoader(this.state.baseStrings[i]);
                    p.image(img,0,425*i);
                }
                let sc = Math.min( window.innerWidth/p.width , window.innerHeight/p.height );
                // sc = Math.round(sc*100);
                this.setState({
                    scale: sc
                });
                this.makeImage();
            };

            p.draw = () => {
                p.noLoop();
            }
        });
    }

    makeImage()
    {
        if(this.canvas)
        {
            let fullCanvasData = (this.canvas.elt.toDataURL());
            this.setState({
                imgSrc: fullCanvasData
            });
        }
        this.sketch.remove();
    }
    
    render()
    {
        return (
            <div style={{
                background: "var(--bg1)",
                display: "flex",
                height: "100%",//'100vh',
                width: '100vw',
                overflowX: "hidden",
                alignItems: "center",
                justifyContent: "center",
            }}>
            <div 
            style={{
                display: "flex",
                flexDirection: "row",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transform: "scale(" + this.state.scale +")"
            }}
            ref={this.myRef}>
                {this.state.imgSrc?(
                    <img src={this.state.imgSrc}/>
                    ):(<></>)}
            </div>
        </div>
        );
    }
}

export default EndSketch;
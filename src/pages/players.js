import React, {Component} from 'react';
import { isMobile } from 'react-device-detect';
import { socket } from '../socket';

class Player extends Component{

    constructor(props)
    {
        super(props);
        this.state = {
            username: this.props.username,
            name: this.props.name,
            active: this.props.active,
            // userActive: false,
        }
        this.send = this.send.bind(this);
        // this.modalFn = this.props.modalFn;
    }

    send(event)
    {
        if(this.state.username==this.state.active)
        {
            const sendTo = new CustomEvent('sendTo', { 
                detail: this.state.name
            });
            window.dispatchEvent(sendTo);
            if(this.props.modalFn)
            { 
                this.props.modalFn();
            }
        }
        event.preventDefault();
    }

    componentDidUpdate(prevProps)
    {
      if(this.props.name !== prevProps.name)
      {
        this.setState({
          name: this.props.name
        });
      }
      if(this.props.active !== prevProps.active)
      {
        this.setState({
            active: this.props.active
        });
      }
    }

    render()
    {
        let isActive = (this.state.username==this.state.active);
        // console.log(this.state.name==this.state.active,this.state.name,this.state.active, isActive)
        let activePlayer = (this.state.name==this.state.active);
        let greenSignal = (
            <div style={{
                width: "0.8em",
                height: "0.8em",
                background: "#21c54a",
                borderRadius: "100%",
                // float: "right"
            }}>

            </div>
        );
        return(
            <div
            className={(isActive)?'player':''}
            style={{
                padding: '1em',
                cursor : (isActive)?'pointer':'auto',
                transition: 'all 0.1s ease-in',
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                // justifyContent: "center"
            }}
            onClick={this.send}
            >
                <div style={{
                    flex: 1,
                    color: (isActive)?'#fff':'#aaa',
                }}>
                    {this.state.name}
                </div>
                {activePlayer?greenSignal:<></>}
            </div>
        );
    }

}

class Players extends Component{

    constructor(props)
    {
        super(props);
        this.state = {
            username: this.props.username,
            playerNames: [],
            // userActive: 'Sagnik',
            modal: false
        }
        this.toggleModal = this.toggleModal.bind(this);
    }

    componentDidMount()
    {
        // console.log(this.state.username);
        socket.emit("getPlayersInfo");
        socket.on("playersInfo", (info) => {
            let names = info.filter( (name) => name != this.state.username)
            this.setState({
                playerNames: names
            });
        });

        socket.on("receiveActive", (name) => {
            this.setState({
                userActive: name
            }); 
        });
    }

    toggleModal()
    {
        this.setState({
            modal: !this.state.modal
        });
    }

    render()
    {
        let mobileRender = (
            <div>
                <div style={{
                    background: this.state.modal?"var(--bg3)":"var(--bg2)",
                    display: "flex",
                    flexDirection: "column",
                    position: "absolute",
                    height: "2.5em",
                    width: "5em",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    top: "1em",
                    right: "1em",
                    borderRadius: "0.5em",
                    fontSize: "1em",
                    lineHeight: "2.5em",
                    margin: "0em 0.8em",
                    // padding: "0 1em",
                }}
                onClick={this.toggleModal}>
                    {this.state.modal?"Close":"Send To"}
                </div>
                {this.state.modal?(<div style={{
                    background: "var(--bg0)",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: "10vw",
                    position: "absolute",
                    width: "50%",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)"
                }}>
                    {
                        this.state.playerNames.map( (name,i) => 
                            <Player 
                                active={this.state.userActive}
                                key={i}  
                                username={this.state.username}  
                                name={name}
                                modalFn={this.toggleModal}
                                >
                            </Player>
                        )
                    }
                </div>):<></>}
            </div>
        );


        let pcRender = (
            <div style={{
                background: "var(--bg0)",
                display: "flex",
                flexDirection: "column",
                minWidth: "10vw",
            }}>
                {
                    this.state.playerNames.map( (name,i) => 
                        <Player 
                            active={this.state.userActive}
                            key={i}  
                            username={this.state.username}  
                            name={name}>
                        </Player>
                    )
                }
            </div>
        );

        return (isMobile?mobileRender:pcRender);
    }
}

export default Players;
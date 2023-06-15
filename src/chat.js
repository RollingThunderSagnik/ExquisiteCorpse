import React, {Component} from 'react';
import Game from './pages/game';
import { socket } from './socket';


class Chat extends Component{

    constructor(props)
    {
      super(props);
      this.state = {
        loggedIn: false,
        username: ''
      };
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({username: event.target.value});
    }

    handleSubmit(event) {
      socket.emit('join', this.state.username);
      event.preventDefault();
    }

    componentDidMount()
    {
      socket.on("join_status",  (status) => {
          if(status)
          {
            this.setState({
              loggedIn: true
            });
          }
          else
          {
            console.log("not joined");
          }
      });
    }

    render()
    {
      const login = (
        <div style={{
          minWidth: "50%",
          background: "var(--bg1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2em"
        }}>

        <input type="text" placeholder={"Type a username..."}
          style={{
            width: "100%",
            marginBottom: "1em",
            height: "2.5em",
          }}
          value={this.state.username} onChange={this.handleChange}/>

        <button 
        style={{
          height: "2.5em",
        }}
        onClick={this.handleSubmit}>Join</button>
        </div>
      );

      return(
        <div style={{
          width: "100vw",
          height: "100%",//"100vh",
          background: "var(--bg0)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflowX: "hidden"
        }}>
          {this.state.loggedIn?<Game username={this.state.username}></Game>:login}
        </div>
      );
    }
}
  
export default Chat;
var socket = io();
window.onload = function () {
  
    // Definitions
    var imgarray = [];
    var savecount = 0;
    var savedHash;
    var pauseBanner = document.getElementById('pause');
    var genButton = document.getElementById('gen');
    var undoButton = document.getElementById('undo');
    var clearButton = document.getElementById('clear');
    var brush = document.getElementById('brush');
    var eraser = document.getElementById('eraser');
    var canvas = document.getElementById("halo");
    var ctx = canvas.getContext("2d");
    var roombox = document.getElementById("roomID");
    var makeroom = document.getElementById("makeroom");
    var roominterface = document.getElementById("mroom");
    var roomID;
    // defaults
    var mouseX = 0;
    var mouseY = 0;
    ctx.lineWidth = 5; // initial brush width
    var isDrawing = false;

   
    

    function drawCue(hash){
      var cue = hash.split("@");
      
      var def = ctx.lineWidth;
      ctx.lineWidth = 1;

      for(var c = 0; c < 20; c++)
      {
        var str = cue[c].split(';');
        ctx.beginPath();
        ctx.moveTo(str[0], c);
        for(var i = 0; i<str.length-1;i++)
        {
          ctx.lineTo(str[i], c);
          ctx.moveTo(str[i+1]-1, c);
        }
        ctx.stroke();
      }
      ctx.lineWidth = def;
    }

    function reset() {
        setBrush();
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 600, 440);
        var def = ctx.lineWidth;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.setLineDash([5,6]);
        ctx.moveTo(0, 420);
        ctx.lineTo(600, 420);
        ctx.moveTo(0, 20);
        ctx.lineTo(600, 20);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = def;
        if(savedHash)
          drawCue(savedHash);
    }
    function setBrush(){
      ctx.strokeStyle = 'black';
      brush.style.color = 'white';
      brush.style.background = 'black';

      eraser.removeAttribute('style');
    }
    function setErase(){
      ctx.strokeStyle = 'white';
      eraser.style.color = 'white';
      eraser.style.background = 'black';


      brush.removeAttribute('style');
    }

    brush.addEventListener('click', function(event) {
      setBrush();
    });
    eraser.addEventListener('click', function(event) {
      setErase();
    });



    reset();

   
    // Handle Brushes
    var brushes = document.getElementsByClassName('brushes')[0];
    brushes.addEventListener('click', function(event) {
      ctx.lineWidth = event.target.value || 5;
    });
    // start stroke
    canvas.addEventListener('mousedown', function(event) {
      var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      imgarray.push(imgData);
      console.log(imgarray.length);
      setMouseCoordinates(event);
      isDrawing = true;
      // Start Drawing
      ctx.beginPath();
      ctx.moveTo(mouseX, mouseY);
    });
    // move
    canvas.addEventListener('mousemove', function(event) {
      setMouseCoordinates(event);
      if(isDrawing){
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      }
    });
    // end stroke
    canvas.addEventListener('mouseup', function(event) {
      setMouseCoordinates(event);
      isDrawing = false;
    });
    //mouse er scam
    function setMouseCoordinates(event) {
      var boundings = canvas.getBoundingClientRect();
      mouseX = event.clientX - boundings.left;
      mouseY = event.clientY - boundings.top;
    }



    //clear the shite
    clearButton.addEventListener('click', function(){
        reset();
    });
    undoButton.addEventListener('click', function(){
          ctx.putImageData(imgarray.pop(), 0, 0);
    });
    

    genButton.addEventListener('click', function(){
      var canvasDataURL = canvas.toDataURL();
      var a = document.createElement('a');
      a.href = canvasDataURL;
      a.download = 'drawing' + savecount++;
      a.click();
      var cue = [];
      for(var c=420;c<440;c++)
      {
        var str = "";
        var imgData = ctx.getImageData(0, c, 600, 1);
        var i;
        for (i = 0; i < imgData.data.length; i += 4) {
          if(imgData.data[i] == 0)
            str = str + (i/4) + ";"
          //imgData.data[i+1] = 0
          //imgData.data[i+2] = 0
        }
        cue.push(str);
      }
      socket.emit('cue', cue.join("@"),roomID,socket.id);
      console.log(socket.id);
    });

    

    socket.on('cue',function(hash,rID,sID){
      console.log("amio peyechi");
      if(roomID == rID)
      {
        if(sID==socket.id)
        {
          pauseBanner.style.opacity = 1;
          pauseBanner.style.zIndex = 1;
        }
        else
        {
          pauseBanner.style.opacity = 0;
          pauseBanner.style.zIndex = -1;
          savedHash = hash;
          reset();
        }
      }
    });

    makeroom.addEventListener('click', function(){
      socket.emit('joinroom', roombox.value, socket.id);
    });

    socket.on('roomfull', function(id){
      if(id == socket.id)
        alert("room full");
    });

    socket.on('roomsuccess', function(rID,id,flag){
      if(id == socket.id)
      { 
        roomID = rID;
        roominterface.style.opacity = 0;
        roominterface.style.zIndex = -1;
        if(flag)
        {
          pauseBanner.style.opacity = 0;
          pauseBanner.style.zIndex = -1;
        }
        else
        {
          pauseBanner.style.opacity = 1;
          pauseBanner.style.zIndex = 1;
          savedHash = hash;
          reset();
        }
      }
    });
};
  
function SignatureCapture( canvasID ) {
	this.canvasID = canvasID;
	this.canvas = $("#"+canvasID);
	this.context = this.canvas.get(0).getContext("2d");
	this.context.strokeStyle = "#000000";
	this.context.lineWidth = 10;
	this.lastMousePoint = {x:0, y:0};
	this.canvas[0].width = this.canvas.parent().innerWidth();
	this.mouseDownEvent = "touchstart";
	this.mouseMoveEvent = "touchmove";
	this.mouseUpEvent = "touchend";
	this.canvas.bind( this.mouseDownEvent, this.onCanvasMouseDown() );
}
SignatureCapture.prototype.onCanvasMouseDown = function () {
	var self = this;
	return function(event) {
		self.mouseMoveHandler = self.onCanvasMouseMove()
		self.mouseUpHandler = self.onCanvasMouseUp()
		$(document).bind( self.mouseMoveEvent, self.mouseMoveHandler );
		$(document).bind( self.mouseUpEvent, self.mouseUpHandler );
		self.updateMousePosition( event );
		self.updateCanvas( event );
	}
}
SignatureCapture.prototype.onCanvasMouseMove = function () {
	var self = this;
	return function(event) {
		self.updateCanvas( event );
     	event.preventDefault();
    	return false;
	}
}
SignatureCapture.prototype.onCanvasMouseUp = function (event) {
	var self = this;
	return function(event) {
		$(document).unbind( self.mouseMoveEvent, self.mouseMoveHandler );
		$(document).unbind( self.mouseUpEvent, self.mouseUpHandler );
		self.mouseMoveHandler = null;
		self.mouseUpHandler = null;
	}
}
SignatureCapture.prototype.updateMousePosition = function (event) {
 	var target = event.originalEvent.touches[0], offset = this.canvas.offset();
	this.lastMousePoint.x = target.pageX - offset.left;
	this.lastMousePoint.y = target.pageY - offset.top;
}
SignatureCapture.prototype.updateCanvas = function (event) {
	this.context.beginPath();
	this.context.moveTo( this.lastMousePoint.x, this.lastMousePoint.y );
	this.updateMousePosition( event );
	this.context.lineTo( this.lastMousePoint.x, this.lastMousePoint.y );
	this.context.stroke();
}
SignatureCapture.prototype.toString = function () {
	var dataString = this.canvas.get(0).toDataURL("image/png");//,index = dataString.indexOf( "," )+1;
	// dataString = dataString.substring( index );
	return dataString;
}
SignatureCapture.prototype.clear = function () {
	var c = this.canvas[0];
	this.context.clearRect( 0, 0, c.width, c.height );
}
SignatureCapture.prototype.draw = function (d) {
	var image = new Image(), _this = this;
	image.src = d;
	image.onload = function() {
	    _this.context.drawImage(image, 0, 0);
	};

}
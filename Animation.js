(function () {
	//canvas element
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext("2d");
	ctx.font = 'normal normal normal 18px/6px Arial';
	var requestAnimationFrame = (function() {
		return	window.requestAnimationFrame ||
			   		window.mozRequestAnimationFrame ||
			   		window.webkitRequestAnimationFrame ||
			   		window.msRequestAnimationFrame;
	}) ();
	
	var cancelAnimationFrame = (function() {
		return window.cancelAnimationFrame ||
			  	window.mozCancelAnimationFrame ||
			  	window.webkitCancelAnimationFrame ||
			  	window.msCancelAnimationFrame;
	}) ();

	var myReq;
	var checker;
	var init_x = 100,
		init_y = 200;
	ctx.fillStyle = '#eee';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	var L = 400; //rope length

	var N = 19; //amount
	
	var h = 20; //max swing height

	var _h = 160;

	//Point
	var Point = function(x0, y0) {
		this.pre_y = y0;
		this.x = x0;
		this.y = y0;
	};
	
	var Flag = function() {
		this.p_x = init_x;
		this.p_y = 0;
		this.x0 = init_x;
		this.y0 = 0;
		this.peaks = {
			peak_1: {
				l: -40,
				x: -30,
				y: -40
			},
			peak_2: {
				l: -40,
				x: 30,
				y: -40
			},
			peak_3: {
				l: -10,
				x: 30,
				y: -10
			},
			peak_4: {
				l: -10,
				x: 10,
				y: -10
			},
			peak_5: {
				l: 0,
				x: 0,
				y: 0
			},
			peak_6: {
				l: -10,
				x: -10,
				y: -10
			},
			peak_7: {
				l: -10,
				x: -30,
				y: -10
			}
		}
	};

	Flag.prototype = {
		updatePer: function(per) {
			this.per = per;
		},

		draw: function(fail) {
			ctx.beginPath();
			var i = 0;
			for(var key in this.peaks) {
				if(i == 0) {
					ctx.moveTo(this.peaks[key].x + this.x0, this.peaks[key].y + this.y0);
				}
				else {
					ctx.lineTo(this.peaks[key].x + this.x0, this.peaks[key].y + this.y0);
				}
				++i;			
			}
			ctx.closePath();
			ctx.strokeStyle = '#ff0';
			ctx.stroke();
			// console.log(this.per);
			ctx.fillStyle = '#ff0';
			// console.log(this.per)
			if(fail !== -1) {
				ctx.fillText(this.per + '%', this.x0 - 15, this.y0 - 15);
			}
			else {
				console.log(animation.fail)
				ctx.fillText('Fail', this.x0 - 15, this.y0 + 35);
			}
		}
	};

	//line
	var Line = function() {
		this.y = init_y;
		this.x = init_x + L / 2;
	};
	
	Line.prototype = {
		draw: function() {
			ctx.beginPath();
			ctx.strokeStyle = '#f0f';
			ctx.lineWidth = 4;
			ctx.lineCap = 'round';
			ctx.moveTo(init_x, init_y);
			ctx.lineTo(this.x, this.y);
			ctx.lineTo(init_x + L, init_y);
			ctx.stroke();
		},

		draw2: function() {
			ctx.beginPath();
			ctx.moveTo(init_x, init_y);
			ctx.lineTo(this.x, this.y);
			ctx.lineWidth = 5;
			ctx.strokeStyle = '#0f0';
			ctx.stroke();
		}
	};

	//Rope
	var Rope = function() {
		this.points = [];
		(function() {
			//initial points
			for (var i = 0; i <= N + 1; i++) {
				var x = init_x + L * i / (N + 1);
				if(i == N + 1) {
					var y = init_y;
				}
				else {
					var y = init_y + _h * Math.sin(i * Math.PI / (N + 1));
				}
				this.points[i] = new Point(x, y);
			};
		}.bind(this)) ();
	};

	Rope.prototype = {
		update: function(dt) {
		
			var r = 1;
			var b = 0.05;
			for (var i = 1; i <= N ; i++) {
				// this.points[i].pre_y  = this.points[i].y;
				var pre = this.points[i].y;
				this.points[i].y = (r * this.points[i+1].y + (2 - 2 * r) * this.points[i].y + r * this.points[i-1].pre_y - this.points[i].pre_y + b * this.points[i].y) / (1 + b);
				this.points[i].pre_y  = pre;
			};

		},

		draw: function() {
			ctx.strokeStyle = '#f0f';
			ctx.beginPath();
			// ctx.moveTo(100, 100);
			// ctx.lineTo(900, 100);
			ctx.lineWidth = 4;
			// ctx.strokeStyle = '#f00';
			ctx.lineCap = 'round';
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.moveTo(this.points[0].x, this.points[0].y);
			for (var i = 1; i < N; i++) {
				ctx.lineTo(this.points[i].x, this.points[i].y);
			};
			ctx.stroke();
		}
	};
	
	//Loader
	var Loader = function() {
		this.line = new Line();
		this.flag = new Flag();
		this.rope = new Rope();
		this.queue = [this.open, this.end];
	};

	Loader.prototype = {
		finish: false,
		over: false,
		open: {
			target: {
				per:0,
				y: init_y
			},
			update: function() {
				if(this.open.target.y - this.flag.y0 >= 0.01) {
					this.flag.y0 = this.flag.y0 + (this.open.target.y - this.flag.y0) / 10;
					this.flag.updatePer(animation.per);
				}
				else {
					this.flag.y0 = this.open.target.y;
					this.finish = true;
					return;
				}
			},
			draw: function() {
				this.flag.draw();
				this.line.draw();
			}
		},
			
		//create middleFrag
		middleFrag: function(newPer) {
			var s_y = (function() {
				if(newPer <= 0.5) {
					var y = h * newPer / 0.5  + init_y;
				}
				else {
					var y = h * (1 - newPer) / 0.5 + init_y;
				}
				return y;
			}) (newPer);

			var mid_frag = {
				target: {
					per: newPer,
					x: newPer * L + init_x,
					y: s_y
				},

				temp: animation.per,

				update: function () {
					if(this.curFrag.target.x - this.flag.x0 >= 0.1 || this.curFrag.target.y - this.flag.y0 >= 0.001) {
						this.flag.x0 = this.flag.x0 + (this.curFrag.target.x - this.flag.x0) / 30;
						this.flag.y0 = this.flag.y0 + (this.curFrag.target.y - this.flag.y0) / 30;
						this.line.x = this.flag.x0;
						this.line.y = this.flag.y0;
						//update flag per
						this.curFrag.temp = this.curFrag.temp + (this.curFrag.target.per - this.curFrag.temp) / 30;
						var fix = this.curFrag.temp.toFixed(2);
						this.flag.updatePer(parseInt(fix * 100));
					}
					else {
						this.flag.x0 = this.curFrag.target.x;
						this.flag.y0 = this.curFrag.target.y;
						animation.per = this.curFrag.target.per;
						this.finish = true;
						return;
					}
				},

				draw: function() {
					this.flag.draw();
					this.line.draw();
					this.line.draw2();
				}
			}

			return mid_frag;
		},
		
		//success
		end: {
			target: {
				y: 0
			},

			update: function() {
				if(this.flag.y0 - this.end.target.y >= 0.1) {
					this.flag.y0 = this.flag.y0 + (this.end.target.y - this.flag.y0) / 40;
				}
				else {
					this.flag.y0 = this.end.target.y;
					this.finish = true;
					return;
				}
			},

			draw: function() {
				this.flag.draw();
				this.line.draw2();
			}
		},
		
		//fail
		fail: {
			//fail_1
			fail_1: {
				target: {
					angle: Math.PI
				},

				theta: 0,

				update: function() {
					//traverse flag.paeks
					var theta = this.fail.fail_1.theta;
					if(Math.PI - theta >= 0.1) {
						for (var key in this.flag.peaks) {
							this.flag.peaks[key].y = this.flag.peaks[key].l * Math.cos(theta);
						};
						this.fail.fail_1.theta += 0.2;
					}
					else {
						this.fail.fail_1.theta = Math.PI;
						for (var key in this.flag.peaks) {
							this.flag.peaks[key].y = this.flag.peaks[key].l * Math.cos(Math.PI);
						};
						this.flag.p_x = this.flag.x0;
						this.flag.p_y = this.flag.y0;
						this.finish = true;
						return;
					}
				},

				draw: function() {
					//traverse flag.peaks
					this.flag.draw(-1);
					this.line.draw();
				}
			},
			
			//fail_2
			fail_2: {
				target: {
					h: 10
				},
				
				t: 0,

				update: function() {
					var t = this.fail.fail_2.t;
					if(t <= 1) {
						this.flag.y0 = this.flag.p_y + h * t * t;
						this.line.y = this.flag.y0;
						this.fail.fail_2.t = (t + 0.01);
					}
					else {
						// this.flag.y0 = this.flag.p_y + this.fail.fail_2.target.h;
						// this.line.y = this.flag.y0;
						this.flag.p_y = this.flag.y0;
						this.finish = true;
						return;
					}

				},

				draw: function() {
					this.flag.draw(-1);
					this.line.draw();
				}
			},
			
			fail_3: {
				target: {
					h: 20
				},
				
				t: 0,

				update: function() {
					var t = this.fail.fail_3.t;
					if(t <= 1) {
						this.flag.y0 = this.flag.p_y + h * t * t;
						this.line.y = this.flag.y0;
						this.fail.fail_3.t = (t + 0.01);
					}
					else {
						// this.flag.y0 = this.flag.p_y + this.fail.fail_3.h;
						// this.line.y = this.flag.y0;
						this.finish = true;
						this.flag.p_y = this.flag.y0;
						return;
					}
				},

				draw: function() {
					this.flag.draw(-1);
					this.line.draw();
				}
			},

			//fail_4
			fail_4: {
				target: {
					y: 1000
				},
				
				g: 4,
				
				begin: true,

				n: 1,

				t: 0.1,

				update: function() {
					if(this.flag.y0 <= this.fail.fail_4.target.y) {
						this.flag.y0 = this.flag.y0 + this.fail.fail_4.n * this.fail.fail_4.g * Math.pow(this.fail.fail_4.t,2) / 2;
						this.rope.update();
						this.fail.fail_4.n += 2;
					}
					else {
						this.finish = true;
						return;
					}
					
				},

				draw: function() {
					this.flag.draw(-1);
					this.rope.draw();
				}
			}
		},
		
		add: function(newPer) {
			if(typeof newPer !== 'number') {
				console.error('argument must be number')
			}
			
			if(newPer !== -1) {
				this.queue.pop();
				this.queue.push(this.middleFrag(newPer));
				this.queue.push(this.end);
			}
			else if(newPer === -1){
				//...execute Fail animation
				this.queue.pop();
				this.queue.push(this.fail.fail_1);
				this.queue.push(this.fail.fail_2);
				this.queue.push(this.fail.fail_3);
				this.queue.push(this.fail.fail_4);
				// for (var failer in this.fail) {
				// 	this.queue.push(this.fail[failer]);
				// };
			}
			else {
				console.error('newPer isn\'t right');
			}
		},
		
		curFrag: null,

		lauch: function(frag) {
			this.curFrag = frag;
			var that = this;
			function animate() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				this.curFrag.update.bind(that)();
				this.curFrag.draw.bind(that)();

				myReq = requestAnimationFrame(animate.bind(that));
				if(this.over) {
					cancelAnimationFrame(myReq)
				}
			}
			animate.bind(that)();
			//requestAnimationFrame()
		},
		
		start: function() {
			this.lauch(this.queue.shift());

			//start switcher
			this.switcher();
		},

		//check and switch next frag
		switcher: function() {
			function check() {
				//check if is over
				if(this.finish) {
					if(this.queue.length) {
						//...switch next frag
						// setTimeout(function() {
							this.lauch(this.queue.shift());
							this.finish = false;
							checker = setTimeout(check.bind(this), 100);
						// }.bind(this), 1000)
						
					}
					else {
						//if frag null , clear cheker
						clearTimeout(checker);
						//cancel animationFrame()
						console.log('Animation Over');
						this.over = true;
						// cancelAnimationFrame(myReq);
					}
				}
				else {
					checker = setTimeout(check.bind(this), 100);	
				}

			};

			check.bind(this)();
		}
	};

	//...Animation
	var Animation = function() {
		//...
		this.loader = new Loader();
	};

	Animation.prototype = {
		// setLoader: function(loader) {
		// 	this.loader = loader;
		// },
		
		per: 0,
		
		setPer: function(newPer) {
			this.loader.add(newPer);
		},

		animate: function() {
			this.loader.start();
		}
	};

	window['animation'] = new Animation();
}) ();


animation.animate();
animation.setPer(0.2);
animation.setPer(0.4);
animation.setPer(0.8);
// animation.setPer(1);
animation.setPer(-1);

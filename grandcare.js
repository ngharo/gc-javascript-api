String.prototype.containsErrors = function() {
	return (this.indexOf('ERROR') === 0) || (this.indexOf('FAILURE') === 0) ? true : false;
};

/**
 * @constructor
 */
function CareNote(system) {
	this.system = system;
	this.subsystem = 'carenote';
	this.op = '';
	this.xml_item = this.subsystem;

	this.create = function(subject, author, body) {
		this.op = 'create';
		var data = this.get({op: this.op, subject: subject, author: author, body: body});

		// push onto existing array
		if(this.read.data == undefined) { this.read.data = new Array(); }
		this.read.data.push(data);

		return data;
	}

	this.remove = function(id) {
		this.op = 'delete';
		var data = this.get({op: this.op, id: id});

		if(this.read.data != undefined) {
			for(var i=0; i<this.read.data.length; i++) {
				if(id == this.read.data[i].id) {
					delete(this.read.data[i]);
				}
			}
		}

		return data;
	}

	this.read = function(args) {
		// optional args: id, date, days
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'read';
		this.read.data = this.get(args);

		return this.read.data;
	}

	this.update = function(id, args) {
		// optional args: subject, author, body
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'update';
		args.id = id;
		var data = this.get(args);

		if(this.read.data != undefined) {
			for(var i=0; i<this.read.data.length; i++) {
				if(id == this.read.data[i].id) {
					this.read.data[i] = data;
				}
			}
		}
	}
}

function CareGiver(system) {
	this.system = system;
	this.subsystem = 'caregiver';
	this.op = '';
	this.xml_item = this.subsystem;

	this.create = function(firstname, lastname, args) {
		// optional args: address, city, state, zip, homephone, workphone, cellphone, pager, email
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'create';
		args.firstname = firstname;
		args.lastname = lastname;
		var data = this.get(args);

		// push onto existing array
		if(this.read.data == undefined) { this.read.data = new Array(); }
		this.read.data.push(data);

		return data;	
	}

	this.remove = function(id) {
		this.op = 'delete';
		var data = this.get({op: this.op, id: id});

		if(this.read.data != undefined) {
			for(var i=0; i<this.read.data.length; i++) {
				if(id == this.read.data[i].id) {
					delete(this.read.data[i]);
				}
			}
		}
	}

	this.read = function(args) {
		// optional args: id
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'read';

		this.read.data = this.get(args);
		return this.read.data;
	}

	this.update = function(id, args) {
		// optional args: firstname, lastname, address, city, state, zip, homephone, workphone, cellphone, pager, email
		args.op = 'update';
		args.id = id;

		var data = this.get(args);

		// update existing data if exists
		if(this.read.data != undefined) {
			for(var i=0; i<this.read.data.length; i++) {
				if(id == this.read.data[i].id) {
					this.read.data[i] = data;
				}
			}
		}

		return data;
	}
}

function Device(system) {
	var self = this;
	this.system = system;
	this.subsystem = 'device';
	this.op = '';
	this.xml_item = this.subsystem;
	this.protocols = ['BT', 'Internal', 'OTU2', 'Tunstall', 'X10', 'ZigBee', 'ZWave'];
	this.classes = ['Alarm', 'Bed', 'BP', 'Button', 'Door', 'Gluc', 'Modem', 'Motion', 'Switch', 'Temp', 'Weight'];
	this.models = [150, 300, 200, 125, 401, 400, 500, 102, 100, 101, 900, 1100, 350, 250, 152, 1, 600, 800, 700, 1000, 501, 550, 151];
	
	this.validator = function(what, type_obj) {
		if (what == '' || what == undefined) return true;
		return (this.type_obj.indexOf(what) >= 0) ? true : false;
	}

	this.prototype.protocol_isValid = this.validator;
	this.prototype.class_isValid = this.validator;
	this.prototype.model_isValid = this.validator;

	this.create = function(model_id, protocol, args) {
		// optional args: location, description
		args.op = 'create';
		args.modelid = model_id;
		args.protocolid = protocol;
		
		if(this.model_isValid(model_id, self.models) && this.protocol_isValid(protocol, self.protocols)) {
			var data = this.get(args);

			if(this.read.data == undefined) { this.read.data = new Array(); }
			this.read.data.push(data);

			return data;
		} else {
			return false;
		}
	}

	this.remove = function(id) {
		this.op = 'delete';
		var data = this.get({op: this.op, id: id});

		if(this.read.data != undefined) {
			for(var i=0; i<this.read.data.length; i++) {
				if(id == this.read.data[i].id) {
					delete(this.read.data[i]);
				}
			}
		}

		return data;
	}

	// id class protocol
	this.read = function(args) {
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'read';

		if(this.class_isValid(args.class, self.classes) && this.protocol_isValid(args.protocol, self.protocols)) {
			this.read.data = this.get(args);
			return this.read.data;
		} else {
			return false;
		}
	}

	this.readmodel = function(args) {
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'readmodel';

		if(this.class_isValid(args.class, self.classes) && this.protocol_isValid(args.protocol, self.classes)) {
			this.readmodel.data = this.get(args);
			return this.readmodel.data;
		} else {
			return false;
		}
	}

	this.update = function(id, args) {
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'update';

		if(this.protocol_isValid(args.protocol, self.protocols)) {
			var data = this.get(args);

			// update existing data if exists
			if(this.read.data != undefined) {
				for(var i=0; i<this.read.data.length; i++) {
					if(id == this.read.data[i].id) {
						this.read.data[i] = data;
					}
				}
			}

			return data;
		} else {
			return false;
		}
	}
}

function Log(system) {
	this.system = system;
	this.subsystem = 'log';
	this.op = '';
	this.xml_item = this.subsystem;

	// TODO fix response object
	this.list = function() {
		this.op = 'list';
		this.xml_item = 'file';

		this.list.data = this.get({op: this.op});
		return this.list.data;
	}

	// TODO fix response object
	this.show = function(logfile, lines) {
		this.op = 'show';
		this.xml_item = 'log-lines';

		var data = this.get({op: this.op, logfile: logfile, lines: lines});
		return data;
	}
}

/**
 * @constructor
 */
function System(sys_array) {
	// system split by @@ from remoteLogin API call
	this.url = sys_array[0];
	this.passcode = sys_array[1];
	this.type = sys_array[2];
	this.name = sys_array[3];
	this.version = sys_array[4];
	this.status = sys_array[5];

	this.history = new History(this);
	this.carenote = new CareNote(this);
	this.caregiver = new CareGiver(this);
	this.device = new Device(this);
	this.log = new Log(this);
}

function SystemStatus() {
	this.INTENTORY = '0';
	this.UP = '1';
	this.DOWN = '2';
	this.PREINSTALL = '3';
	this.DEAD = '4';
	this.REMOTE = '5';
	this.OFF = '6';
}

/**
 * @constructor
 */
function History(system) {
	this.system = system.context;
	this.subsystem = 'history';
	this.op = '';	

	this.bed = function(args) {
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'bed'
		this.bed.data = this.get(args);

		return this.bed.data;
	}

	this.bp = function(args) {
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'bp';
		this.bp.data = this.get(args);

		return this.bp.data;
	}

	this.cid = function(args) {
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'cid';
		this.cid.data = this.get(args);
		
		return this.cid.data;
	}

	this.door = function(args) {
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'door';
		this.door.data = this.get(args);

		return this.door.data;
	}

	this.gluc = function(args) {
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'gluc';
		this.gluc.data = this.get(args);

		return this.gluc.data;
	}

	this.motion = function(args) {
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'motion';
		this.motion.data = this.get(args);

		return this.motion.data;
	}

	this.temp = function(args) {
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'temp';
		this.temp.data = this.get(args);

		return this.temp.data;
	}

	this.weight = function(args) {
		if(typeof(args) != 'object') { args = {};	}
		args.op = 'weight';
		this.weight.data = this.get(args);

		return this.weight.data;
	}
}

History.prototype.chart = function(chart, data) {
	this.dataHandler = function(i, j, k, v, column) {
		switch(k) {
			case 'timestamp':
				if (column) { 
					chart.addColumn('date', 'Date');
				} else {
					chart.setValue(i, j, new Date(v));
				}
				break;

			default:
				if (column) {
					chart.addColumn('number', k);
				} else {
					chart.setValue(i, j, parseInt(v));
				}

		}
	}
	
	for(i=0; i<data.length;i++) {
		// add columns
		if(i==0) {
			for(var k in data[i]) {
				this.dataHandler(i, 0, k, data[i][k], true);
			}

			chart.addRows(data.length);
		}
		
		// add values
		var j = 0;
		for(var k in data[i]) {
			this.dataHandler(i, j, k, data[i][k], false);
			j++;
		}
	}

	return chart;
}


function get(args) {
	var results = new Array();
	var req = new Request(this.system, this.subsystem, args);

	// if xml
	if(req.xhr.responseXML != undefined) {
		if (req.is_valid(req.xhr.responseXML)) {
			if(this.xml_item == undefined) this.xml_item = this.op;

			var items = $(req.xhr.responseXML).find(this.xml_item);
			if (items.length == 0) return true; // for operations with only SUCCESS | FAILURE response

			items.each(function() {
				var response = new Object();

				for(var i=0; i<this.childNodes.length; i++) {
					if (this.childNodes[i].tagName != undefined) {
						// javascript no likey dashes
						var item = this.childNodes[i].tagName.replace('-', '_');

						// catch empty XML nodes
						var value = (this.childNodes[i].firstChild == null) ? '' : this.childNodes[i].firstChild.nodeValue;
						eval('response.' + item + ' = "' + value + '";');
					}
				}

				results.push(response);
			});

		} else {
			return false;
		}

	// if json
	} else {
		if(typeof(req.xhr.responseText) == 'object') {

		}
		// eval json object
	}
	return results;
}


/**
 * @constructor
 */
function Request(system, subsystem, params) {
	// Proxy for cross-site request support; calls php::file_get_contents()
	this.xhr_proxy = '/apiProxy.php?call=';

	this.is_valid = function(xml) {
		if ($(xml).find('result').text() == 'SUCCESS') {
			return true;
		} else {
			return false;
		}
	}

	this.xhr = $.ajax({
		async: false,
		url: this.xhr_proxy + system.url + 'api/' + subsystem + '.php?passcode=' + system.passcode,
		data: params,
		success: this.is_valid
	});
}

/**
 * @constructor
 */
function GCApi(url, user, pass) {
	var self = this;
	this.gcm_url = url;
	this.gcm_user = user;
	this.gcm_pass = pass;
	this.xhr_proxy = '/apiProxy.php?call=';
	this.systems = new Array();
	this.logged_in = false;
	this.context = 0;
	this.context.history = 0;

	// perform remote login
	self.GET(self.gcm_url, 'services.php', {sname: 'remotelogin', username: self.gcm_user, rawpassword: self.gcm_pass}, true);

	if(!self.data.containsErrors()) {
		self.logged_in = true;
		// split remotelogin response by line
		$.each(self.data.split("\n"), function(k,v) {
			if(v != '') {
				// split each line by delimiter
				self.systems.push(new System(v.split('@@')));
			}
		});
	} 
}

GCApi.prototype.findSystem = function(id) {
	var _ = this;

	for(i=0; i < _.systems.length; i++) {
		if (_.systems[i].name.indexOf(id) > 0) {
			_.context = _.systems[i];
			_.context.history = new History(_);
			return _.systems[i];	
		}
	}

	return false;
}

GCApi.prototype.inspect = function() {
	console.log(this);
};

GCApi.prototype.GET = function(url, page, params, sync) {
	var as = (sync) ? false : true;
	var _ = this;

	$.ajax({
		async: as,
		dataType: 'html',
		url: _.xhr_proxy + 'http://' + url + '/' + page + '?f=b',
		data: params,
		success: function(data) {
			_.data = data;
		}
	});
};

History.prototype.get = get;
CareNote.prototype.get = get;
CareGiver.prototype.get = get;
Device.prototype.get = get;
Log.prototype.get = get;

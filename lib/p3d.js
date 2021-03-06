// Generated by CoffeeScript 1.6.3
(function() {
  var ajax, attemptTransfer, base64_encode, capitalize, data, eachLine, fileExt, hermiteSpline, isWorker, parseXml, parserPipeline, sign, startsWith, webWorkerFn, webWorkerURL, workerOptKeys, workerReturnedKeys, _webWorkerURL,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  startsWith = function(str, substring) {
    return str.slice(0, +(substring.length - 1) + 1 || 9e9) === substring;
  };

  eachLine = function(str, callback) {
    var i, line, _i, _len, _ref;
    _ref = str.split(/\r?\n/);
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      line = _ref[i];
      callback(line, i);
    }
    return void 0;
  };

  capitalize = function(str) {
    return "" + (str[0].toUpperCase()) + str.slice(1);
  };

  sign = function(num) {
    if (num > 0) {
      return +1;
    } else if (num < 0) {
      return -1;
    } else {
      return 0;
    }
  };

  fileExt = function(str) {
    return str.split('.').pop();
  };

  ajax = function(opts, callback) {
    var xhr;
    xhr = new XMLHttpRequest();
    xhr.open("GET", opts.url, true);
    xhr.responseType = "blob";
    if (callback != null) {
      xhr.onload = (function() {
        return callback(xhr.response);
      });
    }
    xhr.send();
    return xhr;
  };

  parseXml = function(text) {
    var xmlDoc;
    if (self.DOMParser) {
      return new DOMParser().parseFromString(text, "text/xml");
    } else {
      xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = false;
      return xml.loadXML(text);
    }
  };

  hermiteSpline = function(s, v, t) {
    var c, i, _i, _results;
    c = [[2 * Math.pow(s, 3) - 3 * Math.pow(s, 2) + 1, Math.pow(s, 3) - 2 * Math.pow(s, 2) + s], [-2 * Math.pow(s, 3) + 3 * Math.pow(s, 2), Math.pow(s, 3) - Math.pow(s, 2)]];
    _results = [];
    for (i = _i = 0; _i <= 2; i = ++_i) {
      _results.push(v[0][i] * c[0][0] + t[0][i] * c[0][1] + v[1][i] * c[1][0] + t[1][i] * c[1][1]);
    }
    return _results;
  };

  base64_encode = function(data) {
    var ac, b64, bits, enc, h1, h2, h3, h4, i, o1, o2, o3, r, tmp_arr;
    b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    o1 = void 0;
    o2 = void 0;
    o3 = void 0;
    h1 = void 0;
    h2 = void 0;
    h3 = void 0;
    h4 = void 0;
    bits = void 0;
    i = 0;
    ac = 0;
    enc = "";
    tmp_arr = [];
    if (!data) {
      return data;
    }
    while (true) {
      o1 = data.charCodeAt(i++);
      o2 = data.charCodeAt(i++);
      o3 = data.charCodeAt(i++);
      bits = o1 << 16 | o2 << 8 | o3;
      h1 = bits >> 18 & 0x3f;
      h2 = bits >> 12 & 0x3f;
      h3 = bits >> 6 & 0x3f;
      h4 = bits & 0x3f;
      tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
      if (!(i < data.length)) {
        break;
      }
    }
    enc = tmp_arr.join("");
    r = data.length % 3;
    return (r ? enc.slice(0, r - 3) : enc) + "===".slice(r || 3);
  };

  isWorker = self.document === void 0;

  workerReturnedKeys = ['normals', 'vertices', 'indices', 'nOfTriangles', 'blob'];

  if (!isWorker) {
    webWorkerFn = arguments.callee;
    _webWorkerURL = void 0;
    webWorkerURL = function() {
      var str, webWorkerBlob;
      if (_webWorkerURL != null) {
        return _webWorkerURL;
      }
      str = webWorkerFn.toString();
      str = str.replace(/^\s*function\s*\(\) {/, "").replace(/}\s*$/, '');
      webWorkerBlob = new Blob([str], {
        type: "text/javascript"
      });
      return _webWorkerURL = (window.URL || window.webkitURL).createObjectURL(webWorkerBlob);
    };
  } else {
    parserPipeline = null;
    data = null;
    attemptTransfer = navigator.userAgent.toLowerCase().indexOf('firefox/18') === -1;
    this.onmessage = function(event) {
      return new P3D.Worker(event.data, function(worker) {
        var k, msg, transfers, _i, _len;
        msg = {};
        for (_i = 0, _len = workerReturnedKeys.length; _i < _len; _i++) {
          k = workerReturnedKeys[_i];
          msg[k] = worker[k];
        }
        transfers = (function() {
          var _j, _len1, _ref, _results;
          _ref = ['normals', 'vertices', 'indices'];
          _results = [];
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            k = _ref[_j];
            _results.push(worker[k].buffer);
          }
          return _results;
        })();
        return postMessage(msg, attemptTransfer ? transfers : void 0);
      });
    };
  }

  self.P3D = (function() {
    P3D.prototype._fileTypeWhitelist = ["Stl", "Amf", "Obj"];

    function P3D(src, opts, callback) {
      var _this = this;
      this.opts = opts;
      this.callback = callback;
      this._onWorkerComplete = __bind(this._onWorkerComplete, this);
      this.cloneFromMesh = __bind(this.cloneFromMesh, this);
      if (typeof this.opts === 'function') {
        this.callback = this.opts;
        this.opts = void 0;
      }
      if (this.opts == null) {
        this.opts = {
          background: true
        };
      }
      if ((src.vertices != null) && (src.indices != null) && (src.normals != null)) {
        this._initWorker({
          vertices: src.vertices,
          indices: src.indices,
          normals: src.normals
        });
        return this;
      }
      this.filename = typeof src === "string" ? src.split("/").pop().replace("/", "") : src.name;
      this.fileType = capitalize(fileExt(this.filename).toLowerCase());
      if (this._fileTypeWhitelist.indexOf(this.fileType) === -1) {
        throw "Unable to parse file extension or unsupported file extension: " + this.fileType;
      }
      if (this.fileType === "Amf") {
        this.opts.background = false;
      }
      if (typeof src === "string") {
        ajax({
          url: src
        }, function(response) {
          return _this._initWorker({
            blob: response
          });
        });
      } else if ((src instanceof Blob) || (src instanceof File)) {
        this._initWorker({
          blob: src
        });
      } else {
        throw "Invalid P3D src object.";
      }
    }

    P3D.prototype.cloneFromMesh = function(opts, callback) {
      var k, newSrc, _i, _len, _ref;
      newSrc = {};
      _ref = ["normals", "vertices", "indices"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        newSrc[k] = new Float32Array(this[k]);
      }
      return new P3D(newSrc, opts, callback);
    };

    P3D.prototype._debug = function() {
      return (P3D.debug != null) && P3D.debug;
    };

    P3D.prototype._workerDebugMsg = function(done) {
      var asType, seconds, suffix;
      if (this._debug()) {
        if (done === true) {
          seconds = (new Date().getTime() - this._parserStartMs) / 1000;
          suffix = "[ DONE " + seconds + "s ]";
        } else {
          this._parserStartMs = new Date().getTime();
          suffix = '';
        }
        asType = this.fileType != null ? " as " + (this.fileType.toUpperCase()) : "";
        return console.log("Processing " + (this.filename || 'unnamed model') + asType + ".. " + suffix);
      }
    };

    P3D.prototype._initWorker = function(workerOpts) {
      var k, transfers, worker, _i, _len, _ref,
        _this = this;
      this._workerDebugMsg(false);
      workerOpts.pipeline = this.opts.pipeline || [];
      workerOpts.fileType = this.fileType;
      workerOpts.scale = this.opts.scale;
      if (this.opts.background === true) {
        if (this._debug()) {
          console.log("Running as a background job");
        }
        worker = new Worker(webWorkerURL());
        worker.onmessage = function(e) {
          return _this._onWorkerComplete(e.data);
        };
        worker.addEventListener("error", (function(e) {
          return console.log(e);
        }), false);
        worker.postMessage = worker.webkitPostMessage || worker.postMessage;
        transfers = [];
        _ref = ["vertices", "normals", "indices"];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          k = _ref[_i];
          if (workerOpts[k] != null) {
            transfers.push(workerOpts[k].buffer);
          }
        }
        return worker.postMessage(workerOpts, transfers);
      } else {
        return new P3D.Worker(workerOpts, this._onWorkerComplete);
      }
    };

    P3D.prototype._onWorkerComplete = function(worker) {
      var k, _i, _len;
      for (_i = 0, _len = workerReturnedKeys.length; _i < _len; _i++) {
        k = workerReturnedKeys[_i];
        this[k] = worker[k];
      }
      this._workerDebugMsg(true);
      return typeof this.callback === "function" ? this.callback(this) : void 0;
    };

    return P3D;

  })();

  workerOptKeys = ["blob", "vertices", "indices", "normals", "fileType", "scale"];

  self.P3D.Worker = (function() {
    function Worker(opts, callback) {
      var k, _i, _len;
      this.callback = callback;
      this._eachFace = __bind(this._eachFace, this);
      this._onReaderLoad = __bind(this._onReaderLoad, this);
      for (_i = 0, _len = workerOptKeys.length; _i < _len; _i++) {
        k = workerOptKeys[_i];
        this[k] = opts[k];
      }
      this.pipeline = opts.pipeline || [];
      this.pipeline.push("_applyScaling");
      if (this.blob != null) {
        this._initReader("Text");
      } else {
        this._executePipeline();
        this.callback(this);
      }
    }

    Worker.prototype._executePipeline = function() {
      var _results;
      _results = [];
      while (this.pipeline.length > 0) {
        _results.push(this[this.pipeline.pop()]());
      }
      return _results;
    };

    Worker.prototype._toMillimeters = function(unitsOfMeasurement) {
      var conversions, scale;
      conversions = {
        mm: 1.0,
        millimeter: 1.0,
        meter: 1000.0,
        inch: 25.4,
        feet: 304.8,
        micron: 0.001
      };
      scale = conversions[unitsOfMeasurement.toLowerCase()];
      if (scale != null) {
        return scale;
      }
      throw "" + unitsOfMeasurement + " is not a known unit of measurement";
    };

    Worker.prototype._initGeometry = function(nOfTriangles, nOfIndices) {
      var i, indices, _i, _ref;
      this.nOfTriangles = nOfTriangles;
      this.normals = new Float32Array(this.nOfTriangles * 9);
      this.vertices = this.verts = new Float32Array(this.nOfTriangles * 9);
      if (nOfIndices != null) {
        this.indices = new Uint32Array(nOfIndices);
      } else {
        indices = this.indices = new Uint32Array(this.nOfTriangles * 3);
        for (i = _i = 0, _ref = indices.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          indices[i] = i;
        }
      }
      return [this.normals, this.verts, this.indices];
    };

    Worker.prototype._addFace = function(face, mesh, index) {
      var attr, j, k, _i, _len, _ref, _results;
      _ref = ['vertices', 'normals'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (k = _j = 0; _j <= 2; k = ++_j) {
            _results1.push((function() {
              var _k, _results2;
              _results2 = [];
              for (j = _k = 0; _k <= 2; j = ++_k) {
                _results2.push(mesh[attr][index + j * 3 + k] = face[attr][j][k]);
              }
              return _results2;
            })());
          }
          return _results1;
        })());
      }
      return _results;
    };

    Worker.prototype._expandVerts = function() {
      var attr, exp, i, _i, _j, _k, _len, _len1, _ref, _ref1, _ref2,
        _this = this;
      this.nOfTriangles = this.indices.length / 3;
      exp = {};
      _ref = ['vertices', 'normals'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        exp[attr] = new Float32Array(this.nOfTriangles * 9);
      }
      this._eachFace(function(face, i) {
        return _this._addFace(face, exp, i * 9);
      });
      for (i = _j = 0, _ref1 = this.indices.length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        this.indices[i] = i;
      }
      _ref2 = ['vertices', 'normals'];
      for (_k = 0, _len1 = _ref2.length; _k < _len1; _k++) {
        attr = _ref2[_k];
        this[attr] = exp[attr];
      }
      return this.verts = this.vertices;
    };

    Worker.prototype._initReader = function(type) {
      var r;
      if (type != null) {
        this.dataType = type;
      }
      r = this.reader = new FileReader();
      r.onload = this._onReaderLoad;
      return r["readAs" + type](this.blob);
    };

    Worker.prototype._binaryStlCheck = function(text) {
      return this.fileType === "Stl" && this.dataType === "Text" && text.slice(0, 81).match(/^solid /) === null;
    };

    Worker.prototype._onReaderLoad = function() {
      data = this.reader.result;
      delete this.reader;
      if (this._binaryStlCheck(data)) {
        return this._initReader("ArrayBuffer");
      }
      this["_parse" + this.dataType + this.fileType](data);
      this._executePipeline();
      return this.callback(this);
    };

    Worker.prototype._parseTextAmf = function(text) {
      var $, attr, cross, exp, i, indiceCount, indices, isFlat, magnitude, nOfTriangles, nOfVerts, normalize, normals, read, root, scale, subdivide, subdivisionLevels, trianglesPerSurface, unitStr, vertCount, verts, xml, xmlEval, _i, _j, _k, _len, _len1, _ref, _ref1, _ref2, _ref3,
        _this = this;
      xml = parseXml(text);
      root = xml.documentElement;
      xmlEval = function(query) {
        return xml.evaluate(query, xml, null, XPathResult.ANY_TYPE, null);
      };
      read = function(node, k) {
        return node.getElementsByTagName(k)[0].textContent;
      };
      $ = function(query, callback) {
        var node, results;
        results = xmlEval(query);
        while ((node = results.iterateNext()) != null) {
          callback(node);
        }
        return void 0;
      };
      unitStr = root.getAttribute("unit") || root.getAttribute("units");
      scale = this._toMillimeters(unitStr);
      vertCount = 0;
      indiceCount = 0;
      nOfTriangles = xmlEval('count(//triangle)').numberValue;
      nOfVerts = xmlEval('count(//vertex)').numberValue;
      _ref = this._initGeometry(nOfVerts, nOfTriangles * 3), normals = _ref[0], verts = _ref[1], indices = _ref[2];
      $("//vertex", function(node) {
        var coords, i, k, n, normalNodeList, _i, _len, _ref1, _results;
        coords = node.getElementsByTagName("coordinates")[0];
        normalNodeList = node.getElementsByTagName("normal");
        if (normalNodeList.length === 1) {
          n = (function() {
            var _i, _len, _ref1, _results;
            _ref1 = ['nx', 'ny', 'nz'];
            _results = [];
            for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
              k = _ref1[i];
              _results.push(normals[vertCount + i] = parseFloat(read(normalNodeList[0], k)));
            }
            return _results;
          })();
        }
        _ref1 = ['x', 'y', 'z'];
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          k = _ref1[_i];
          _results.push(verts[vertCount++] = parseFloat(read(coords, k)) * scale);
        }
        return _results;
      });
      $("//triangle", function(node) {
        var k, _i, _results;
        _results = [];
        for (k = _i = 1; _i <= 3; k = ++_i) {
          _results.push(indices[indiceCount++] = parseInt(read(node, "v" + k)));
        }
        return _results;
      });
      isFlat = function(face) {
        var n, _ref1;
        return ((n = face.normals)[0] === (_ref1 = n[1]) && _ref1 === n[2]);
      };
      cross = function(vA, vB) {
        return [vA[1] * vB[2] - vA[2] * vB[1], vA[2] * vB[0] - vA[0] * vB[2], vA[0] * vB[1] - vA[1] * vB[0]];
      };
      magnitude = function(v) {
        return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2) + Math.pow(v[2], 2));
      };
      normalize = function(v) {
        var i, length, _i, _results;
        length = magnitude(v);
        _results = [];
        for (i = _i = 0; _i <= 2; i = ++_i) {
          _results.push(v[i] = v[i] / length);
        }
        return _results;
      };
      this._expandVerts();
      nOfTriangles = this.nOfTriangles;
      this._eachFace(this._calculateVertexNormals);
      subdivisionLevels = 4;
      trianglesPerSurface = Math.pow(4, subdivisionLevels);
      this._eachFace(function(face) {
        if (!isFlat(face)) {
          return nOfTriangles += trianglesPerSurface - 1;
        }
      });
      exp = {};
      _ref1 = ['vertices', 'normals'];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        attr = _ref1[_i];
        exp[attr] = new Float32Array(nOfTriangles * 9);
      }
      vertCount = 0;
      subdivide = function(face, fIndex) {
        var crossProduct, d, edge, i, j, midNormals, midVerts, n, n01, newFaces, t, v, v01, _j, _len1, _ref2;
        midVerts = [];
        midNormals = [];
        _ref2 = [[0, 1], [1, 2], [2, 0]];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          edge = _ref2[_j];
          v = [face.vertices[edge[0]], face.vertices[edge[1]]];
          n = [face.normals[edge[0]], face.normals[edge[1]]];
          d = (function() {
            var _k, _results;
            _results = [];
            for (i = _k = 0; _k <= 2; i = ++_k) {
              _results.push(v[1][i] - v[0][i]);
            }
            return _results;
          })();
          t = (function() {
            var _k, _results;
            _results = [];
            for (i = _k = 0; _k <= 1; i = ++_k) {
              crossProduct = cross(cross(n[i], d), n[i]);
              _results.push((function() {
                var _l, _results1;
                _results1 = [];
                for (j = _l = 0; _l <= 2; j = ++_l) {
                  _results1.push(magnitude(d) * crossProduct[j] / magnitude(crossProduct));
                }
                return _results1;
              })());
            }
            return _results;
          })();
          midVerts.push(v01 = hermiteSpline(0.5, v, t, fIndex));
          midNormals.push(n01 = normalize((function() {
            var _k, _results;
            _results = [];
            for (i = _k = 0; _k <= 2; i = ++_k) {
              _results.push((n[1][i] + n[0][i]) / 2);
            }
            return _results;
          })()));
        }
        newFaces = (function() {
          var _k, _results;
          _results = [];
          for (i = _k = 0; _k <= 2; i = ++_k) {
            _results.push({
              vertices: [midVerts[i], midVerts[j = (i + 2) % 3], face.vertices[i]],
              normals: [midNormals[i], midNormals[j], face.normals[i]]
            });
          }
          return _results;
        })();
        newFaces.push({
          vertices: midVerts,
          normals: midNormals
        });
        return newFaces;
      };
      this._eachFace(function(face, fIndex) {
        var f, f2, faces, i, j, k, newFaces, _j, _k, _l, _len1, _len2, _len3, _len4, _m, _n, _o, _p, _ref2, _ref3, _ref4, _results;
        if (isFlat(face)) {
          _ref2 = ['vertices', 'normals'];
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            attr = _ref2[_j];
            for (k = _k = 0; _k <= 2; k = ++_k) {
              for (j = _l = 0; _l <= 2; j = ++_l) {
                exp[attr][vertCount + j * 3 + k] = face[attr][j][k];
              }
            }
          }
          return vertCount += 9;
        } else {
          faces = [face];
          newFaces = [];
          for (i = _m = 0, _ref3 = subdivisionLevels - 1; 0 <= _ref3 ? _m <= _ref3 : _m >= _ref3; i = 0 <= _ref3 ? ++_m : --_m) {
            newFaces = [];
            for (_n = 0, _len2 = faces.length; _n < _len2; _n++) {
              f = faces[_n];
              _ref4 = subdivide(f, fIndex + Math.pow(4, i));
              for (_o = 0, _len3 = _ref4.length; _o < _len3; _o++) {
                f2 = _ref4[_o];
                newFaces.push(f2);
              }
            }
            faces = newFaces;
          }
          _results = [];
          for (_p = 0, _len4 = newFaces.length; _p < _len4; _p++) {
            f = newFaces[_p];
            _this._addFace(f, exp, vertCount);
            _results.push(vertCount += 9);
          }
          return _results;
        }
      });
      indices = this.indices = new Float32Array(nOfTriangles * 3);
      for (i = _j = 0, _ref2 = this.indices.length - 1; 0 <= _ref2 ? _j <= _ref2 : _j >= _ref2; i = 0 <= _ref2 ? ++_j : --_j) {
        this.indices[i] = i;
      }
      _ref3 = ['vertices', 'normals'];
      for (_k = 0, _len1 = _ref3.length; _k < _len1; _k++) {
        attr = _ref3[_k];
        this[attr] = exp[attr];
      }
      this.verts = this.vertices;
      this.nOfTriangles = nOfTriangles;
      this._eachFace(this._calculateVertexNormals);
      this.nOfTriangles = nOfTriangles;
      return void 0;
    };

    Worker.prototype._parseEachLine = function(text, prefixes, opts, callback) {
      var lines, nOfTriangles;
      nOfTriangles = 0;
      lines = function(fn) {
        return eachLine(text, function(line, index) {
          if (index >= opts.headerLines) {
            return fn(line, index);
          }
        });
      };
      lines(function(line) {
        if (line.indexOf(prefixes.face) !== -1) {
          return nOfTriangles++;
        }
      });
      this._initGeometry(nOfTriangles);
      lines(function(line, index) {
        line = line.replace(/^\s+|\s+$/g, '').replace(/\s{2,}/g, ' ').toLowerCase();
        return callback(line, index);
      });
      return void 0;
    };

    Worker.prototype._parseTextObj = function(text) {
      var indexCount, prefixes, vertCount,
        _this = this;
      prefixes = {
        normal: "vn ",
        vert: "v ",
        face: "f "
      };
      indexCount = 0;
      vertCount = 0;
      this._parseEachLine(text, prefixes, {
        headerLines: 0
      }, function(line, index) {
        var s, str, v, vectorStrings, _i, _j, _len, _len1, _ref, _ref1;
        if (startsWith(line, prefixes.vert)) {
          vectorStrings = line.split(/\s/).slice(1);
          if (vectorStrings.length < 3) {
            throw "Parsing Error: " + vectorStrings.length + " vector vertex";
          }
          _ref = vectorStrings.slice(0, 3);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            s = _ref[_i];
            _this.vertices[vertCount++] = v = parseFloat(s);
            if (isNaN(v) || !isFinite(v)) {
              throw "Parsing Error: Vertex vector #" + vertCount + " is not a number";
            }
          }
        } else if (startsWith(line, prefixes.face)) {
          _ref1 = line.split(/\s/).slice(1);
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            str = _ref1[_j];
            _this.indices[indexCount++] = parseInt(str.split('/')[0]) - 1;
          }
        }
        return void 0;
      });
      this._expandVerts();
      this._eachFace(this._calculateVertexNormals);
      return void 0;
    };

    Worker.prototype._parseTextStl = function(text) {
      var ignoredPrefixes, normalCount, prefixes, vertCount,
        _this = this;
      prefixes = {
        normal: "facet normal ",
        vert: "vertex ",
        face: "facet"
      };
      ignoredPrefixes = ["outer", "endloop", "facet", "endfacet", "endsolid"];
      normalCount = 0;
      vertCount = 0;
      this._parseEachLine(text, prefixes, {
        headerLines: 1
      }, function(line, index) {
        var k, s, v, vectorStrings, _i, _len;
        if (startsWith(line, prefixes.vert)) {
          vectorStrings = line.split(/\s/).slice(1);
          if (vectorStrings.length !== 3) {
            throw "Parsing Error: " + vectorStrings.length + " vector vertex";
          }
          for (_i = 0, _len = vectorStrings.length; _i < _len; _i++) {
            s = vectorStrings[_i];
            _this.vertices[vertCount++] = v = parseFloat(s);
            if (isNaN(v) || !isFinite(v)) {
              throw "Parsing Error: Vertex vector #" + vertCount + " is not a number";
            }
          }
        } else if (line.length > 0) {
          if ((function() {
            var _j, _len1, _results;
            _results = [];
            for (_j = 0, _len1 = ignoredPrefixes.length; _j < _len1; _j++) {
              k = ignoredPrefixes[_j];
              _results.push(startsWith(line, k));
            }
            return _results;
          })()) {
            return;
          }
          throw "Parsing Error: Invalid Line \n " + line;
        }
        return void 0;
      });
      this._eachFace(this._calculateVertexNormals);
      return void 0;
    };

    Worker.prototype._parseArrayBufferStl = function(arrayBuffer) {
      var dataPointer, i, indices, j, nOfTriangles, normals, readFloat32, readUint16, readUint32, verts, _i, _j, _k, _read, _ref, _ref1;
      data = new DataView(arrayBuffer, 80);
      dataPointer = 0;
      _read = function(method, bytes) {
        var val;
        val = data[method](dataPointer, true);
        dataPointer += bytes;
        return val;
      };
      readFloat32 = function() {
        return _read("getFloat32", 4);
      };
      readUint32 = function() {
        return _read("getUint32", 4);
      };
      readUint16 = function() {
        return _read("getUint16", 2);
      };
      nOfTriangles = readUint32();
      _ref = this._initGeometry(nOfTriangles), normals = _ref[0], verts = _ref[1], indices = _ref[2];
      for (i = _i = 0, _ref1 = nOfTriangles - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
        for (j = _j = 0; _j <= 2; j = ++_j) {
          readFloat32();
        }
        for (j = _k = 0; _k <= 8; j = ++_k) {
          verts[i * 9 + j] = readFloat32();
        }
        readUint16();
      }
      this._eachFace(this._calculateVertexNormals);
      return void 0;
    };

    Worker.prototype.exportTextStl = function() {
      var formatFloat, formatVector, str;
      str = "solid P3D\n";
      formatFloat = function(flt, i) {
        return (sign(flt) >= 0 || i === 0 ? " " : "") + flt.toExponential(6);
      };
      formatVector = function(array, v) {
        var i;
        return ((function() {
          var _i, _results;
          _results = [];
          for (i = _i = 0; _i <= 2; i = ++_i) {
            _results.push(formatFloat(array[i], v ? i : 1));
          }
          return _results;
        })()).join(" ");
      };
      this._eachFace(function(f, i) {
        var v, _i, _len, _ref;
        str += "  facet normal " + (formatVector(f.normals[0], false)) + "\n";
        str += "    outer loop\n";
        _ref = f.vertices;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          str += "      vertex " + (formatVector(v, true)) + "\n";
        }
        str += "    endloop\n";
        return str += "  endfacet\n";
      });
      str += "endsolid P3D";
      str = str.replace(/e\+([0-9][^0-9])/g, "e+0$1");
      str = str.replace(/e\-([0-9][^0-9])/g, "e-0$1");
      return this.blob = new Blob([str], {
        type: "application/octet-stream"
      });
    };

    Worker.prototype._applyScaling = function() {
      var i, j, scale, _i, _ref, _results;
      if (this.scale != null) {
        scale = this.scale;
        if (typeof scale === "number") {
          scale = (function() {
            var _i, _results;
            _results = [];
            for (i = _i = 0; _i <= 2; i = ++_i) {
              _results.push(scale);
            }
            return _results;
          })();
        }
        _results = [];
        for (i = _i = 0, _ref = this.vertices.length; _i <= _ref; i = _i += 3) {
          _results.push((function() {
            var _j, _results1;
            _results1 = [];
            for (j = _j = 0; _j <= 2; j = ++_j) {
              _results1.push(this.vertices[i + j] = this.vertices[i + j] * scale[j]);
            }
            return _results1;
          }).call(this));
        }
        return _results;
      }
    };

    Worker.prototype._eachFace = function(fn) {
      var i, indices, _i, _ref;
      indices = this.indices;
      for (i = _i = 0, _ref = this.indices.length - 3; _i <= _ref; i = _i += 3) {
        fn(this._face(indices.subarray(i, i + 3)), i / 3);
      }
      return void 0;
    };

    Worker.prototype._face = function(fIndices) {
      var index;
      return {
        indices: fIndices,
        normals: (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = fIndices.length; _i < _len; _i++) {
            index = fIndices[_i];
            _results.push(this.normals.subarray(index * 3, index * 3 + 3));
          }
          return _results;
        }).call(this),
        vertices: (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = fIndices.length; _i < _len; _i++) {
            index = fIndices[_i];
            _results.push(this.vertices.subarray(index * 3, index * 3 + 3));
          }
          return _results;
        }).call(this)
      };
    };

    Worker.prototype._flipFace = function(f) {
      var firstIndex;
      firstIndex = f.indices[0];
      f.indices[0] = f.indices[1];
      return f.indices[1] = firstIndex;
    };

    Worker.prototype._calculateVertexNormals = function(f) {
      var i, j, len, v, vN, _i, _j, _results;
      v = (function() {
        var _i, _results;
        _results = [];
        for (i = _i = 1; _i <= 2; i = ++_i) {
          _results.push((function() {
            var _j, _results1;
            _results1 = [];
            for (j = _j = 0; _j <= 2; j = ++_j) {
              _results1.push(f.vertices[i][j] - f.vertices[0][j]);
            }
            return _results1;
          })());
        }
        return _results;
      })();
      vN = [(v[0][1] * v[1][2]) - (v[0][2] * v[1][1]), (v[0][2] * v[1][0]) - (v[0][0] * v[1][2]), (v[0][0] * v[1][1]) - (v[0][1] * v[1][0])];
      len = Math.sqrt(vN[0] * vN[0] + vN[1] * vN[1] + vN[2] * vN[2]);
      for (i = _i = 0; _i <= 2; i = ++_i) {
        vN[i] = vN[i] / len;
      }
      _results = [];
      for (i = _j = 0; _j <= 2; i = ++_j) {
        if (f.normals[i][0] === 0 && f.normals[i][1] === 0 && f.normals[i][2] === 0) {
          _results.push((function() {
            var _k, _results1;
            _results1 = [];
            for (j = _k = 0; _k <= 2; j = ++_k) {
              _results1.push(f.normals[i][j] = vN[j]);
            }
            return _results1;
          })());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return Worker;

  })();

}).call(this);

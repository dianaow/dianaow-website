import createIntervalTree from "interval-tree-1d";
console.log(createIntervalTree)
/**
 *  Vertex as in the ´Vertex List´ paper of Esperanca and Samet, 1998
 **/
class Vertex {
    
  // A vertex with weight w and coordinates p[0],p[1],etc
  constructor (w, p=[]) {
    this.w = w;
    this.p = p.slice()
  }

  // A deep copy of this Vertex
  clone() {
    return new Vertex(this.w, this.p)
  }
    
  // The dimension of this vertex
  get dim () {
    return this.p.length
  }

  // Rotates the axes for this vertex coordinates (in place).  
  rotAxesClock () {
    this.p.unshift(this.p.pop());
    return this
  } 
  
  // Undoes rotAxesClock
  rotAxesCounter () {
    this.p.push(this.p.shift());
    return this
  }
  
  // The last coordinate of this vertex
  get lastCoord () {
    return this.p[this.p.length-1]
  }
  
  // Comparison function for establishing ordering between vertices.
  // Returns -1,0 or 0 according to whether this vertex precedes, is equal, or 
  // follows vertex other in scanline order.
  cmp (other) {
    if (!(this.dim ==other.dim)) {
      console.assert (this.dim ==other.dim);
    }
    for (let i = this.p.length-1; i >= 0; i--) {
      if (this.p[i] < other.p[i]) return -1;
      if (this.p[i] > other.p[i]) return +1;
    }
    return 0;
  }
 

  // Returns a new vertex with weight equal to w*scalar
  scale(scalar) {
    console.assert(scalar!=0)
    return new Vertex(this.w*scalar,this.p)
  }

  // Returns a new vertex with one dimension less
  project() {
    return new Vertex(this.w,this.p.slice(0,this.p.length-1))
  }

  // Returns a new vertex with one extra dimension, having h as the additional coordinate
  unproject(h) {
    return new Vertex(this.w,this.p.concat([h]))
  }

  // Returns true if point q is in the cone of this vertex
  dominates(q) {
    for (let i = 0; i < this.p.length; i++) {
      if (q[i] < this.p[i]) return false
    }
    return true
  }
  
  // Translates this vertex (in place) by vector u
  translate (u) {
    for (let i = 0; i < this.p.length; i++) {
      this.p[i] += u[i]
    }
    return this
  }

  repr () {
    return "("+this.w+",["+this.p+"])";
  }
  
}

/**
 * A Vertex List - data structure to represent multidimensional orthogonal fields
 **/
class VList extends Array {
  // Constructor from an array of vertices
  constructor (...l) {
    super(...l);
    this.sort((a,b) => a.cmp(b))
  }
  
  clone () {
    let clone = new VList();
    for (let v of this) clone.push(v.clone())
    return clone
  }
  
  // Returns a new VList with clockwise rotated vertices
  rotAxesClock () {;
    let clone = [];
    for (let v of this) clone.push(v.clone().rotAxesClock());
    return new VList (...clone)
  } 
  
  // Returns a new VList with counterclockwise rotated vertices
  rotAxesCounter () {
    let clone = [];
    for (let v of this) clone.push(v.clone().rotAxesCounter());
    return new VList (...clone)
  }
  
  // A string representation of a VList
  repr () {
    let s = "{";
    for (let x of this) s+=x.repr();
    return s+"}"
  }
    
  // Returns the length of the prefix"
  prefixLen() {
    if (this.length == 0) return 0;
    let c = this[0].lastCoord;
    let n = 0;
    for (let v of this) { 
      if (v.lastCoord != c) return n;
      n++;
    }
    return n;
  }
  
  // Returns a VList containing all vertices from the beginning of the list
  // with the same last coordinate
  prefix() {
    let plen = this.prefixLen();
    return this.slice(0,plen);
  }
  
  // Returns this VList with its prefix removed
  remainder() {
    let plen = this.prefixLen();
    return this.slice(plen);
  } 
  
  // Combines prefix and remainder in a single operation
  split () {
    let plen = this.prefixLen();
    return [this.slice(0,plen), this.slice(plen)]
  }
  // Returns this VList with one dimension less
  project() {
    let r = new VList();
    for (let x of this) r.push(x.project());
    return r;
  }
  
  // Returns this VList with one extra dimension, having  h as the additional coordinate
  unproject(h) {
    let r = new VList();
    for (let x of this) r.push(x.unproject(h));
    return r;
  }
  
  // Returns the sum of this and other
  add(other) {
    console.assert (other instanceof VList);
    let r = new VList();
    let i = 0, j = 0;
    while (i<this.length && j< other.length) {
      let cmp = this[i].cmp (other[j]);
      if (cmp < 0) 
        r.push(this[i++])
      else if (cmp > 0) 
        r.push(other[j++])
      else {
        let v = new Vertex(this[i].w+other[j].w,this[i].p)
        if (v.w != 0) r.push(v);
        i++; j++;
      }
    }
    while (i<this.length) r.push (this[i++]);
    while (j<other.length) r.push (other[j++]);
    return r
  }
  
  // Returns a VList where all vertices have their weights multiplied by scalar
  scale (scalar) {
    let r = new VList();
    
    for (let v of this) {
      r.push(v.scale(scalar))
    }
    return r
  }
  
  // Returns the value of the field at point q
  value (q) {
    console.assert (this.length == 0 || this[0].dim == q.length);
    let wsum = 0;
    for (let v of this) {
      if (v.dominates(q)) wsum += v.w
    }
    return wsum;
  }
  
  
  // Returns this field transformed by scalar function f
  transform(f) {
    if (this.length == 0) {
      return new VList();
    }
    if (this[0].dim == 0) { 
      let w = f(this[0].w);
      let r = w != 0 ? new VList(new Vertex(w,[])) : new VList();
      return r
    }
    let r = new VList();
    let o = new VList();
    let t = new VList();
    let rem = new VList(...this);
    let pref;
    while (rem.length > 0) {
      [pref,rem] = rem.split();
      let coord = pref[0].lastCoord;
      let proj = pref.project();
      o = o.add (proj);
      let transf = o.transform(f);
      let delta = transf.add(t.scale(-1));
      for (let x of delta.unproject(coord)) r.push(x);
      t = transf;
    }
    return r
  }
  
  // Returns the decomposition of this list as a list of vlists, each one corresponding to 
  // a single (hyper-)rectanble
  rectangles () {
    let r = [];
    if (this.length == 0) return r;
    console.assert(this[0].dim > 0);
    if (this[0].dim == 1) {
      let prevw = 0, prevx = Number.MINUS_INFINITY;
      for (let v of this) {
        if (prevw != 0) {
          r.push (new VList(new Vertex (prevw, [prevx]), new Vertex (-prevw, [v.p[0]])));
        }
        prevw += v.w;
        prevx = v.p[0];
      }
    }
    else {
      let rem = new VList(...this), pref = new VList();
      let prevpref = new VList(), prevcoord;
      while (rem.length > 0) {
        [pref,rem] = rem.split();
        let coord = pref[0].lastCoord;
        let s = prevpref.project();
        for (let face of s.rectangles()) { 
          let rect = face.unproject(prevcoord);
          for (let v of face) {
            let q = v.unproject(coord);
            q.w = -q.w;
            rect.push (q);
          }
          r.push (rect);
        }
        prevcoord = coord;
        prevpref = s.unproject(coord).add(pref);
      }
    }
    return r
  }
  
  // Returns the horizontal (scanline) faces of this field
  faces () {
    let r = [];
    if (this.length == 0) return r;
    console.assert(this[0].dim > 1);
    let rem = new VList(...this), pref = new VList();
    while (rem.length > 0) {
      [pref,rem] = rem.split();
      let coord = pref[0].lastCoord;
      for (let rect of pref.project().rectangles()) r.push(rect.unproject(coord));
    }
    return r;
  }
  
  // Translates all vertices in list by vector u (in place)
  translate (u) {
    for (let v of this) v.translate(u);
    return this
  }
} 

// A data structure for quick intersection tests against an orthogonal polygon
class RectList {
  
  // Constructor from a vertex list
  constructor (vlist) {
    this.rects = vlist.rectangles();
    this.it = createIntervalTree(this.rects.map(r=>{
      let interval = [r[0].p[1],r[3].p[1]];
      interval.rect = r
      return interval
    }))
  }
  
  rangeSearch (ymin,ymax) {
    let all = [];
    this.it.queryInterval (ymin,ymax,interval=>{all.push(interval)});
    return all;
  }
  
  // Returns true if polygon intersects point p
  pointIntersection (p) {
    for (let interval of this.rangeSearch(p[1],p[1]+1)) {
      let r = interval.rect;
      if (r[3].p[1]>p[1] && r[3].p[0]>p[0] && r[0].p[0]<=p[0]) return true;
    }
    return false
  }
  
  // Returns true if polygon intersects rectangle R
  rectIntersection (R) {
    let ymin = R[0].p[1];
    let ymax = R[3].p[1];
    for (let interval of this.rangeSearch(ymin,ymax)) {
      let r = interval.rect;
      if (rectRectIntersect (r,R)) return true;
    }
    return false
  }
}

export class RectArrangement {
  constructor(
    center = [0, 0],
    options = {
      heuristic: "first",
      metric: "euclidean",
      closeFreq: 1,
      closeFactor: 0.5
    }
  ) {
    this.center = center;
    this.rects = [];
    this.polygon = new VList();
    Object.assign(this, options);
    this.distance =
      this.metric == "chessboard"
        ? (p, q) => Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]))
        : this.metric == "euclidean"
        ? (p, q) => Math.sqrt((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2)
        : (p, q) => Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]);
  }

  closePolygon(amount) {
    this.polygon = topo(topo(this.polygon, amount), -amount);
  }

  addRect(area, aspect) {
    let [cx, cy] = this.center;
    let sidex = Math.sqrt(area * aspect);
    let sidey = area / sidex;
    let [dx, dy] = [sidex / 2, sidey / 2];
    let d = Math.sqrt(dx * dx + dy * dy);
    let s = undefined;
    let poly;
    if (this.rects.length == 0) {
      s = rectangle([cx - dx, cy - dy], [sidex, sidey]);
    } else {
      let distToCenter = Number.MAX_VALUE;
      let vtx = [...this.polygon].map(v => {
        v.dist = this.distance(v.p, this.center);
        return v;
      });
      vtx.sort((a, b) => a.dist - b.dist);
      let rlist = new RectList(this.polygon);
      for (let v of vtx) {
        let [x, y] = v.p;
        if (v.dist > distToCenter + d) continue; // Worse than the best so far
        for (let [sx, sy, sign] of [
          [x, y, -1],
          [x - sidex, y, +1],
          [x, y - sidey, +1],
          [x - sidex, y - sidey, -1]
        ]) {
          if (Math.sign(v.w) != sign) continue; // Wrong sign
          let candidate = rectangle([sx, sy], [sidex, sidey]);
          let [scx, scy] = [sx + dx, sy + dy]; // Center of rectangle
          if (rlist.pointIntersection([scx, scy])) continue; // Center inside polygon
          if (rlist.rectIntersection(candidate)) continue; // Polygon intersects rectangl
          let dist = this.distance([scx, scy], [cx, cy]);
          if (!s || dist < distToCenter) {
            s = candidate;
            distToCenter = dist;
          }
        }
        if (this.heuristic == "first" && s) break;
      }
    }
    if (s == undefined)
      throw "Something went wrong : could not find a place for rect";
    this.rects.push(s);
    this.polygon = union(this.polygon, s);
    let factor = d * this.closeFactor;
    if (this.rects.length % 1 == 0) this.closePolygon(factor);
  }
}

// Returns a vertex list representing a rectangle having [length,height] equal to sides
// and minimum corner (corner with smallest coordinates) at mincorner
function rectangle (minCorner = [0,0], sides = [10,10]) {
  let [x,y] = minCorner;
  let [sidex,sidey] = sides;
  return new VList(
    new Vertex(+1,[x,y]),
    new Vertex(-1,[x+sidex,y]),
    new Vertex(-1,[x,y+sidey]),
    new Vertex(+1,[x+sidex,y+sidey])
  )
} 

// Returns true iff rectangle a intersects rectangle b
function rectRectIntersect (a,b) {
  return Math.min(a[3].p[0],b[3].p[0]) > Math.max(a[0].p[0],b[0].p[0]) &&
         Math.min(a[3].p[1],b[3].p[1]) > Math.max(a[0].p[1],b[0].p[1])
}

// Returns the union of two orthogonal polygons represented as vertex lists
function union (a,b) {
  return a.add(b).transform(w => +(w>0))
}

// Returns the polygon given by vlist dilated (positive d) or contracted (negative d)
function topo (vlist, d) {
  if (d < 0) return erode (vlist,-d)
  else return dilate (vlist, d)
}

function erode(vlist,d) {
  if (vlist.length < 4) return new VList();
  // Find bounding box
  let {min,max} = boundingBox(vlist);
  for (let v of vlist) {
    for (let i of [0,1]) {
      if (v.p[i] < min[i]) min[i] = v.p[i];
      if (v.p[i] > max[i]) max[i] = v.p[i];
    }
  }
  let m = 10; //margin
  let box = rectangle ([min[0]-m,min[1]-m],[max[0]-min[0]+m+m,max[1]-min[1]+m+m]);
  // subtract 
  let boxMinus = new VList();
  boxMinus.push(box[0],box[1]);
  for (let v of vlist) boxMinus.push (v.scale(-1));
  boxMinus.push(box[2],box[3]);
  // dilate the result
  let result = dilate(boxMinus,d);
  // Return -hole
  return result.slice(2,result.length-2).map(v=>{v.w = -v.w; return v})
}

// Returns the polygon given by vlist dilated by d
function dilate (vlist, d) {
  let vtx = [];
  for (let r of vlist.rectangles()) {
    [[-d,-d],[d,-d],[-d,d],[d,d]].forEach(([dx,dy],i) => {
      r[i].p[0]+=dx;
      r[i].p[1]+=dy;
      vtx.push(r[i]);
    });
  }
  return normalizeVList(new VList(...vtx)).transform(w => +(w>0))
}

// Returns the minimum and maximum corner of the smallest rectangle containing all vertices of vlist
function boundingBox (vlist) {
  let min = [Number.MAX_VALUE,Number.MAX_VALUE],
      max = [Number.MIN_VALUE,Number.MIN_VALUE];
  for (let v of vlist) {
    for (let i of [0,1]) {
      if (v.p[i] < min[i]) min[i] = v.p[i];
      if (v.p[i] > max[i]) max[i] = v.p[i];
    }
  }
  return {min,max}
}

// Returns a normalized vlist, i.e., one with no 2 vertices at the same position
function normalizeVList(vlist) {
  if (vlist.length < 2) return vlist;
  let result = new VList();
  let prev = vlist[0];
  for (let i = 1; i < vlist.length; i++) {
    let next = vlist[i];
    if (prev.cmp(next) == 0) {
      prev.w += next.w;
    }
    else {
      if (prev.w != 0) result.push (prev)
      prev = next;
    }
  }
  if (prev.w != 0) result.push (prev)
  return result;
}  
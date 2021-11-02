
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function (exports) {
    'use strict';

    function noop() { }
    const identity = x => x;
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var crossfilter$1 = createCommonjsModule(function (module, exports) {
    (function(exports){
    crossfilter.version = "1.3.12";
    function crossfilter_identity(d) {
      return d;
    }
    crossfilter.permute = permute;

    function permute(array, index) {
      for (var i = 0, n = index.length, copy = new Array(n); i < n; ++i) {
        copy[i] = array[index[i]];
      }
      return copy;
    }
    var bisect = crossfilter.bisect = bisect_by(crossfilter_identity);

    bisect.by = bisect_by;

    function bisect_by(f) {

      // Locate the insertion point for x in a to maintain sorted order. The
      // arguments lo and hi may be used to specify a subset of the array which
      // should be considered; by default the entire array is used. If x is already
      // present in a, the insertion point will be before (to the left of) any
      // existing entries. The return value is suitable for use as the first
      // argument to `array.splice` assuming that a is already sorted.
      //
      // The returned insertion point i partitions the array a into two halves so
      // that all v < x for v in a[lo:i] for the left side and all v >= x for v in
      // a[i:hi] for the right side.
      function bisectLeft(a, x, lo, hi) {
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (f(a[mid]) < x) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }

      // Similar to bisectLeft, but returns an insertion point which comes after (to
      // the right of) any existing entries of x in a.
      //
      // The returned insertion point i partitions the array into two halves so that
      // all v <= x for v in a[lo:i] for the left side and all v > x for v in
      // a[i:hi] for the right side.
      function bisectRight(a, x, lo, hi) {
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (x < f(a[mid])) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }

      bisectRight.right = bisectRight;
      bisectRight.left = bisectLeft;
      return bisectRight;
    }
    var heap = crossfilter.heap = heap_by(crossfilter_identity);

    heap.by = heap_by;

    function heap_by(f) {

      // Builds a binary heap within the specified array a[lo:hi]. The heap has the
      // property such that the parent a[lo+i] is always less than or equal to its
      // two children: a[lo+2*i+1] and a[lo+2*i+2].
      function heap(a, lo, hi) {
        var n = hi - lo,
            i = (n >>> 1) + 1;
        while (--i > 0) sift(a, i, n, lo);
        return a;
      }

      // Sorts the specified array a[lo:hi] in descending order, assuming it is
      // already a heap.
      function sort(a, lo, hi) {
        var n = hi - lo,
            t;
        while (--n > 0) t = a[lo], a[lo] = a[lo + n], a[lo + n] = t, sift(a, 1, n, lo);
        return a;
      }

      // Sifts the element a[lo+i-1] down the heap, where the heap is the contiguous
      // slice of array a[lo:lo+n]. This method can also be used to update the heap
      // incrementally, without incurring the full cost of reconstructing the heap.
      function sift(a, i, n, lo) {
        var d = a[--lo + i],
            x = f(d),
            child;
        while ((child = i << 1) <= n) {
          if (child < n && f(a[lo + child]) > f(a[lo + child + 1])) child++;
          if (x <= f(a[lo + child])) break;
          a[lo + i] = a[lo + child];
          i = child;
        }
        a[lo + i] = d;
      }

      heap.sort = sort;
      return heap;
    }
    var heapselect = crossfilter.heapselect = heapselect_by(crossfilter_identity);

    heapselect.by = heapselect_by;

    function heapselect_by(f) {
      var heap = heap_by(f);

      // Returns a new array containing the top k elements in the array a[lo:hi].
      // The returned array is not sorted, but maintains the heap property. If k is
      // greater than hi - lo, then fewer than k elements will be returned. The
      // order of elements in a is unchanged by this operation.
      function heapselect(a, lo, hi, k) {
        var queue = new Array(k = Math.min(hi - lo, k)),
            min,
            i,
            d;

        for (i = 0; i < k; ++i) queue[i] = a[lo++];
        heap(queue, 0, k);

        if (lo < hi) {
          min = f(queue[0]);
          do {
            if (f(d = a[lo]) > min) {
              queue[0] = d;
              min = f(heap(queue, 0, k)[0]);
            }
          } while (++lo < hi);
        }

        return queue;
      }

      return heapselect;
    }
    var insertionsort = crossfilter.insertionsort = insertionsort_by(crossfilter_identity);

    insertionsort.by = insertionsort_by;

    function insertionsort_by(f) {

      function insertionsort(a, lo, hi) {
        for (var i = lo + 1; i < hi; ++i) {
          for (var j = i, t = a[i], x = f(t); j > lo && f(a[j - 1]) > x; --j) {
            a[j] = a[j - 1];
          }
          a[j] = t;
        }
        return a;
      }

      return insertionsort;
    }
    // Algorithm designed by Vladimir Yaroslavskiy.
    // Implementation based on the Dart project; see lib/dart/LICENSE for details.

    var quicksort = crossfilter.quicksort = quicksort_by(crossfilter_identity);

    quicksort.by = quicksort_by;

    function quicksort_by(f) {
      var insertionsort = insertionsort_by(f);

      function sort(a, lo, hi) {
        return (hi - lo < quicksort_sizeThreshold
            ? insertionsort
            : quicksort)(a, lo, hi);
      }

      function quicksort(a, lo, hi) {
        // Compute the two pivots by looking at 5 elements.
        var sixth = (hi - lo) / 6 | 0,
            i1 = lo + sixth,
            i5 = hi - 1 - sixth,
            i3 = lo + hi - 1 >> 1,  // The midpoint.
            i2 = i3 - sixth,
            i4 = i3 + sixth;

        var e1 = a[i1], x1 = f(e1),
            e2 = a[i2], x2 = f(e2),
            e3 = a[i3], x3 = f(e3),
            e4 = a[i4], x4 = f(e4),
            e5 = a[i5], x5 = f(e5);

        var t;

        // Sort the selected 5 elements using a sorting network.
        if (x1 > x2) t = e1, e1 = e2, e2 = t, t = x1, x1 = x2, x2 = t;
        if (x4 > x5) t = e4, e4 = e5, e5 = t, t = x4, x4 = x5, x5 = t;
        if (x1 > x3) t = e1, e1 = e3, e3 = t, t = x1, x1 = x3, x3 = t;
        if (x2 > x3) t = e2, e2 = e3, e3 = t, t = x2, x2 = x3, x3 = t;
        if (x1 > x4) t = e1, e1 = e4, e4 = t, t = x1, x1 = x4, x4 = t;
        if (x3 > x4) t = e3, e3 = e4, e4 = t, t = x3, x3 = x4, x4 = t;
        if (x2 > x5) t = e2, e2 = e5, e5 = t, t = x2, x2 = x5, x5 = t;
        if (x2 > x3) t = e2, e2 = e3, e3 = t, t = x2, x2 = x3, x3 = t;
        if (x4 > x5) t = e4, e4 = e5, e5 = t, t = x4, x4 = x5, x5 = t;

        var pivot1 = e2, pivotValue1 = x2,
            pivot2 = e4, pivotValue2 = x4;

        // e2 and e4 have been saved in the pivot variables. They will be written
        // back, once the partitioning is finished.
        a[i1] = e1;
        a[i2] = a[lo];
        a[i3] = e3;
        a[i4] = a[hi - 1];
        a[i5] = e5;

        var less = lo + 1,   // First element in the middle partition.
            great = hi - 2;  // Last element in the middle partition.

        // Note that for value comparison, <, <=, >= and > coerce to a primitive via
        // Object.prototype.valueOf; == and === do not, so in order to be consistent
        // with natural order (such as for Date objects), we must do two compares.
        var pivotsEqual = pivotValue1 <= pivotValue2 && pivotValue1 >= pivotValue2;
        if (pivotsEqual) {

          // Degenerated case where the partitioning becomes a dutch national flag
          // problem.
          //
          // [ |  < pivot  | == pivot | unpartitioned | > pivot  | ]
          //  ^             ^          ^             ^            ^
          // left         less         k           great         right
          //
          // a[left] and a[right] are undefined and are filled after the
          // partitioning.
          //
          // Invariants:
          //   1) for x in ]left, less[ : x < pivot.
          //   2) for x in [less, k[ : x == pivot.
          //   3) for x in ]great, right[ : x > pivot.
          for (var k = less; k <= great; ++k) {
            var ek = a[k], xk = f(ek);
            if (xk < pivotValue1) {
              if (k !== less) {
                a[k] = a[less];
                a[less] = ek;
              }
              ++less;
            } else if (xk > pivotValue1) {

              // Find the first element <= pivot in the range [k - 1, great] and
              // put [:ek:] there. We know that such an element must exist:
              // When k == less, then el3 (which is equal to pivot) lies in the
              // interval. Otherwise a[k - 1] == pivot and the search stops at k-1.
              // Note that in the latter case invariant 2 will be violated for a
              // short amount of time. The invariant will be restored when the
              // pivots are put into their final positions.
              while (true) {
                var greatValue = f(a[great]);
                if (greatValue > pivotValue1) {
                  great--;
                  // This is the only location in the while-loop where a new
                  // iteration is started.
                  continue;
                } else if (greatValue < pivotValue1) {
                  // Triple exchange.
                  a[k] = a[less];
                  a[less++] = a[great];
                  a[great--] = ek;
                  break;
                } else {
                  a[k] = a[great];
                  a[great--] = ek;
                  // Note: if great < k then we will exit the outer loop and fix
                  // invariant 2 (which we just violated).
                  break;
                }
              }
            }
          }
        } else {

          // We partition the list into three parts:
          //  1. < pivot1
          //  2. >= pivot1 && <= pivot2
          //  3. > pivot2
          //
          // During the loop we have:
          // [ | < pivot1 | >= pivot1 && <= pivot2 | unpartitioned  | > pivot2  | ]
          //  ^            ^                        ^              ^             ^
          // left         less                     k              great        right
          //
          // a[left] and a[right] are undefined and are filled after the
          // partitioning.
          //
          // Invariants:
          //   1. for x in ]left, less[ : x < pivot1
          //   2. for x in [less, k[ : pivot1 <= x && x <= pivot2
          //   3. for x in ]great, right[ : x > pivot2
          for (var k = less; k <= great; k++) {
            var ek = a[k], xk = f(ek);
            if (xk < pivotValue1) {
              if (k !== less) {
                a[k] = a[less];
                a[less] = ek;
              }
              ++less;
            } else {
              if (xk > pivotValue2) {
                while (true) {
                  var greatValue = f(a[great]);
                  if (greatValue > pivotValue2) {
                    great--;
                    if (great < k) break;
                    // This is the only location inside the loop where a new
                    // iteration is started.
                    continue;
                  } else {
                    // a[great] <= pivot2.
                    if (greatValue < pivotValue1) {
                      // Triple exchange.
                      a[k] = a[less];
                      a[less++] = a[great];
                      a[great--] = ek;
                    } else {
                      // a[great] >= pivot1.
                      a[k] = a[great];
                      a[great--] = ek;
                    }
                    break;
                  }
                }
              }
            }
          }
        }

        // Move pivots into their final positions.
        // We shrunk the list from both sides (a[left] and a[right] have
        // meaningless values in them) and now we move elements from the first
        // and third partition into these locations so that we can store the
        // pivots.
        a[lo] = a[less - 1];
        a[less - 1] = pivot1;
        a[hi - 1] = a[great + 1];
        a[great + 1] = pivot2;

        // The list is now partitioned into three partitions:
        // [ < pivot1   | >= pivot1 && <= pivot2   |  > pivot2   ]
        //  ^            ^                        ^             ^
        // left         less                     great        right

        // Recursive descent. (Don't include the pivot values.)
        sort(a, lo, less - 1);
        sort(a, great + 2, hi);

        if (pivotsEqual) {
          // All elements in the second partition are equal to the pivot. No
          // need to sort them.
          return a;
        }

        // In theory it should be enough to call _doSort recursively on the second
        // partition.
        // The Android source however removes the pivot elements from the recursive
        // call if the second partition is too large (more than 2/3 of the list).
        if (less < i1 && great > i5) {
          var lessValue, greatValue;
          while ((lessValue = f(a[less])) <= pivotValue1 && lessValue >= pivotValue1) ++less;
          while ((greatValue = f(a[great])) <= pivotValue2 && greatValue >= pivotValue2) --great;

          // Copy paste of the previous 3-way partitioning with adaptions.
          //
          // We partition the list into three parts:
          //  1. == pivot1
          //  2. > pivot1 && < pivot2
          //  3. == pivot2
          //
          // During the loop we have:
          // [ == pivot1 | > pivot1 && < pivot2 | unpartitioned  | == pivot2 ]
          //              ^                      ^              ^
          //            less                     k              great
          //
          // Invariants:
          //   1. for x in [ *, less[ : x == pivot1
          //   2. for x in [less, k[ : pivot1 < x && x < pivot2
          //   3. for x in ]great, * ] : x == pivot2
          for (var k = less; k <= great; k++) {
            var ek = a[k], xk = f(ek);
            if (xk <= pivotValue1 && xk >= pivotValue1) {
              if (k !== less) {
                a[k] = a[less];
                a[less] = ek;
              }
              less++;
            } else {
              if (xk <= pivotValue2 && xk >= pivotValue2) {
                while (true) {
                  var greatValue = f(a[great]);
                  if (greatValue <= pivotValue2 && greatValue >= pivotValue2) {
                    great--;
                    if (great < k) break;
                    // This is the only location inside the loop where a new
                    // iteration is started.
                    continue;
                  } else {
                    // a[great] < pivot2.
                    if (greatValue < pivotValue1) {
                      // Triple exchange.
                      a[k] = a[less];
                      a[less++] = a[great];
                      a[great--] = ek;
                    } else {
                      // a[great] == pivot1.
                      a[k] = a[great];
                      a[great--] = ek;
                    }
                    break;
                  }
                }
              }
            }
          }
        }

        // The second partition has now been cleared of pivot elements and looks
        // as follows:
        // [  *  |  > pivot1 && < pivot2  | * ]
        //        ^                      ^
        //       less                  great
        // Sort the second partition using recursive descent.

        // The second partition looks as follows:
        // [  *  |  >= pivot1 && <= pivot2  | * ]
        //        ^                        ^
        //       less                    great
        // Simply sort it by recursive descent.

        return sort(a, less, great + 1);
      }

      return sort;
    }

    var quicksort_sizeThreshold = 32;
    var crossfilter_array8 = crossfilter_arrayUntyped,
        crossfilter_array16 = crossfilter_arrayUntyped,
        crossfilter_array32 = crossfilter_arrayUntyped,
        crossfilter_arrayLengthen = crossfilter_arrayLengthenUntyped,
        crossfilter_arrayWiden = crossfilter_arrayWidenUntyped;

    if (typeof Uint8Array !== "undefined") {
      crossfilter_array8 = function(n) { return new Uint8Array(n); };
      crossfilter_array16 = function(n) { return new Uint16Array(n); };
      crossfilter_array32 = function(n) { return new Uint32Array(n); };

      crossfilter_arrayLengthen = function(array, length) {
        if (array.length >= length) return array;
        var copy = new array.constructor(length);
        copy.set(array);
        return copy;
      };

      crossfilter_arrayWiden = function(array, width) {
        var copy;
        switch (width) {
          case 16: copy = crossfilter_array16(array.length); break;
          case 32: copy = crossfilter_array32(array.length); break;
          default: throw new Error("invalid array width!");
        }
        copy.set(array);
        return copy;
      };
    }

    function crossfilter_arrayUntyped(n) {
      var array = new Array(n), i = -1;
      while (++i < n) array[i] = 0;
      return array;
    }

    function crossfilter_arrayLengthenUntyped(array, length) {
      var n = array.length;
      while (n < length) array[n++] = 0;
      return array;
    }

    function crossfilter_arrayWidenUntyped(array, width) {
      if (width > 32) throw new Error("invalid array width!");
      return array;
    }
    function crossfilter_filterExact(bisect, value) {
      return function(values) {
        var n = values.length;
        return [bisect.left(values, value, 0, n), bisect.right(values, value, 0, n)];
      };
    }

    function crossfilter_filterRange(bisect, range) {
      var min = range[0],
          max = range[1];
      return function(values) {
        var n = values.length;
        return [bisect.left(values, min, 0, n), bisect.left(values, max, 0, n)];
      };
    }

    function crossfilter_filterAll(values) {
      return [0, values.length];
    }
    function crossfilter_null() {
      return null;
    }
    function crossfilter_zero() {
      return 0;
    }
    function crossfilter_reduceIncrement(p) {
      return p + 1;
    }

    function crossfilter_reduceDecrement(p) {
      return p - 1;
    }

    function crossfilter_reduceAdd(f) {
      return function(p, v) {
        return p + +f(v);
      };
    }

    function crossfilter_reduceSubtract(f) {
      return function(p, v) {
        return p - f(v);
      };
    }
    exports.crossfilter = crossfilter;

    function crossfilter() {
      var crossfilter = {
        add: add,
        remove: removeData,
        dimension: dimension,
        groupAll: groupAll,
        size: size
      };

      var data = [], // the records
          n = 0, // the number of records; data.length
          m = 0, // a bit mask representing which dimensions are in use
          M = 8, // number of dimensions that can fit in `filters`
          filters = crossfilter_array8(0), // M bits per record; 1 is filtered out
          filterListeners = [], // when the filters change
          dataListeners = [], // when data is added
          removeDataListeners = []; // when data is removed

      // Adds the specified new records to this crossfilter.
      function add(newData) {
        var n0 = n,
            n1 = newData.length;

        // If there's actually new data to add…
        // Merge the new data into the existing data.
        // Lengthen the filter bitset to handle the new records.
        // Notify listeners (dimensions and groups) that new data is available.
        if (n1) {
          data = data.concat(newData);
          filters = crossfilter_arrayLengthen(filters, n += n1);
          dataListeners.forEach(function(l) { l(newData, n0, n1); });
        }

        return crossfilter;
      }

      // Removes all records that match the current filters.
      function removeData() {
        var newIndex = crossfilter_index(n, n),
            removed = [];
        for (var i = 0, j = 0; i < n; ++i) {
          if (filters[i]) newIndex[i] = j++;
          else removed.push(i);
        }

        // Remove all matching records from groups.
        filterListeners.forEach(function(l) { l(0, [], removed); });

        // Update indexes.
        removeDataListeners.forEach(function(l) { l(newIndex); });

        // Remove old filters and data by overwriting.
        for (var i = 0, j = 0, k; i < n; ++i) {
          if (k = filters[i]) {
            if (i !== j) filters[j] = k, data[j] = data[i];
            ++j;
          }
        }
        data.length = j;
        while (n > j) filters[--n] = 0;
      }

      // Adds a new dimension with the specified value accessor function.
      function dimension(value) {
        var dimension = {
          filter: filter,
          filterExact: filterExact,
          filterRange: filterRange,
          filterFunction: filterFunction,
          filterAll: filterAll,
          top: top,
          bottom: bottom,
          group: group,
          groupAll: groupAll,
          dispose: dispose,
          remove: dispose // for backwards-compatibility
        };

        var one = ~m & -~m, // lowest unset bit as mask, e.g., 00001000
            zero = ~one, // inverted one, e.g., 11110111
            values, // sorted, cached array
            index, // value rank ↦ object id
            newValues, // temporary array storing newly-added values
            newIndex, // temporary array storing newly-added index
            sort = quicksort_by(function(i) { return newValues[i]; }),
            refilter = crossfilter_filterAll, // for recomputing filter
            refilterFunction, // the custom filter function in use
            indexListeners = [], // when data is added
            dimensionGroups = [],
            lo0 = 0,
            hi0 = 0;

        // Updating a dimension is a two-stage process. First, we must update the
        // associated filters for the newly-added records. Once all dimensions have
        // updated their filters, the groups are notified to update.
        dataListeners.unshift(preAdd);
        dataListeners.push(postAdd);

        removeDataListeners.push(removeData);

        // Incorporate any existing data into this dimension, and make sure that the
        // filter bitset is wide enough to handle the new dimension.
        m |= one;
        if (M >= 32 ? !one : m & -(1 << M)) {
          filters = crossfilter_arrayWiden(filters, M <<= 1);
        }
        preAdd(data, 0, n);
        postAdd(data, 0, n);

        // Incorporates the specified new records into this dimension.
        // This function is responsible for updating filters, values, and index.
        function preAdd(newData, n0, n1) {

          // Permute new values into natural order using a sorted index.
          newValues = newData.map(value);
          newIndex = sort(crossfilter_range(n1), 0, n1);
          newValues = permute(newValues, newIndex);

          // Bisect newValues to determine which new records are selected.
          var bounds = refilter(newValues), lo1 = bounds[0], hi1 = bounds[1], i;
          if (refilterFunction) {
            for (i = 0; i < n1; ++i) {
              if (!refilterFunction(newValues[i], i)) filters[newIndex[i] + n0] |= one;
            }
          } else {
            for (i = 0; i < lo1; ++i) filters[newIndex[i] + n0] |= one;
            for (i = hi1; i < n1; ++i) filters[newIndex[i] + n0] |= one;
          }

          // If this dimension previously had no data, then we don't need to do the
          // more expensive merge operation; use the new values and index as-is.
          if (!n0) {
            values = newValues;
            index = newIndex;
            lo0 = lo1;
            hi0 = hi1;
            return;
          }

          var oldValues = values,
              oldIndex = index,
              i0 = 0,
              i1 = 0;

          // Otherwise, create new arrays into which to merge new and old.
          values = new Array(n);
          index = crossfilter_index(n, n);

          // Merge the old and new sorted values, and old and new index.
          for (i = 0; i0 < n0 && i1 < n1; ++i) {
            if (oldValues[i0] < newValues[i1]) {
              values[i] = oldValues[i0];
              index[i] = oldIndex[i0++];
            } else {
              values[i] = newValues[i1];
              index[i] = newIndex[i1++] + n0;
            }
          }

          // Add any remaining old values.
          for (; i0 < n0; ++i0, ++i) {
            values[i] = oldValues[i0];
            index[i] = oldIndex[i0];
          }

          // Add any remaining new values.
          for (; i1 < n1; ++i1, ++i) {
            values[i] = newValues[i1];
            index[i] = newIndex[i1] + n0;
          }

          // Bisect again to recompute lo0 and hi0.
          bounds = refilter(values), lo0 = bounds[0], hi0 = bounds[1];
        }

        // When all filters have updated, notify index listeners of the new values.
        function postAdd(newData, n0, n1) {
          indexListeners.forEach(function(l) { l(newValues, newIndex, n0, n1); });
          newValues = newIndex = null;
        }

        function removeData(reIndex) {
          for (var i = 0, j = 0, k; i < n; ++i) {
            if (filters[k = index[i]]) {
              if (i !== j) values[j] = values[i];
              index[j] = reIndex[k];
              ++j;
            }
          }
          values.length = j;
          while (j < n) index[j++] = 0;

          // Bisect again to recompute lo0 and hi0.
          var bounds = refilter(values);
          lo0 = bounds[0], hi0 = bounds[1];
        }

        // Updates the selected values based on the specified bounds [lo, hi].
        // This implementation is used by all the public filter methods.
        function filterIndexBounds(bounds) {
          var lo1 = bounds[0],
              hi1 = bounds[1];

          if (refilterFunction) {
            refilterFunction = null;
            filterIndexFunction(function(d, i) { return lo1 <= i && i < hi1; });
            lo0 = lo1;
            hi0 = hi1;
            return dimension;
          }

          var i,
              j,
              k,
              added = [],
              removed = [];

          // Fast incremental update based on previous lo index.
          if (lo1 < lo0) {
            for (i = lo1, j = Math.min(lo0, hi1); i < j; ++i) {
              filters[k = index[i]] ^= one;
              added.push(k);
            }
          } else if (lo1 > lo0) {
            for (i = lo0, j = Math.min(lo1, hi0); i < j; ++i) {
              filters[k = index[i]] ^= one;
              removed.push(k);
            }
          }

          // Fast incremental update based on previous hi index.
          if (hi1 > hi0) {
            for (i = Math.max(lo1, hi0), j = hi1; i < j; ++i) {
              filters[k = index[i]] ^= one;
              added.push(k);
            }
          } else if (hi1 < hi0) {
            for (i = Math.max(lo0, hi1), j = hi0; i < j; ++i) {
              filters[k = index[i]] ^= one;
              removed.push(k);
            }
          }

          lo0 = lo1;
          hi0 = hi1;
          filterListeners.forEach(function(l) { l(one, added, removed); });
          return dimension;
        }

        // Filters this dimension using the specified range, value, or null.
        // If the range is null, this is equivalent to filterAll.
        // If the range is an array, this is equivalent to filterRange.
        // Otherwise, this is equivalent to filterExact.
        function filter(range) {
          return range == null
              ? filterAll() : Array.isArray(range)
              ? filterRange(range) : typeof range === "function"
              ? filterFunction(range)
              : filterExact(range);
        }

        // Filters this dimension to select the exact value.
        function filterExact(value) {
          return filterIndexBounds((refilter = crossfilter_filterExact(bisect, value))(values));
        }

        // Filters this dimension to select the specified range [lo, hi].
        // The lower bound is inclusive, and the upper bound is exclusive.
        function filterRange(range) {
          return filterIndexBounds((refilter = crossfilter_filterRange(bisect, range))(values));
        }

        // Clears any filters on this dimension.
        function filterAll() {
          return filterIndexBounds((refilter = crossfilter_filterAll)(values));
        }

        // Filters this dimension using an arbitrary function.
        function filterFunction(f) {
          refilter = crossfilter_filterAll;

          filterIndexFunction(refilterFunction = f);

          lo0 = 0;
          hi0 = n;

          return dimension;
        }

        function filterIndexFunction(f) {
          var i,
              k,
              x,
              added = [],
              removed = [];

          for (i = 0; i < n; ++i) {
            if (!(filters[k = index[i]] & one) ^ !!(x = f(values[i], i))) {
              if (x) filters[k] &= zero, added.push(k);
              else filters[k] |= one, removed.push(k);
            }
          }
          filterListeners.forEach(function(l) { l(one, added, removed); });
        }

        // Returns the top K selected records based on this dimension's order.
        // Note: observes this dimension's filter, unlike group and groupAll.
        function top(k) {
          var array = [],
              i = hi0,
              j;

          while (--i >= lo0 && k > 0) {
            if (!filters[j = index[i]]) {
              array.push(data[j]);
              --k;
            }
          }

          return array;
        }

        // Returns the bottom K selected records based on this dimension's order.
        // Note: observes this dimension's filter, unlike group and groupAll.
        function bottom(k) {
          var array = [],
              i = lo0,
              j;

          while (i < hi0 && k > 0) {
            if (!filters[j = index[i]]) {
              array.push(data[j]);
              --k;
            }
            i++;
          }

          return array;
        }

        // Adds a new group to this dimension, using the specified key function.
        function group(key) {
          var group = {
            top: top,
            all: all,
            reduce: reduce,
            reduceCount: reduceCount,
            reduceSum: reduceSum,
            order: order,
            orderNatural: orderNatural,
            size: size,
            dispose: dispose,
            remove: dispose // for backwards-compatibility
          };

          // Ensure that this group will be removed when the dimension is removed.
          dimensionGroups.push(group);

          var groups, // array of {key, value}
              groupIndex, // object id ↦ group id
              groupWidth = 8,
              groupCapacity = crossfilter_capacity(groupWidth),
              k = 0, // cardinality
              select,
              heap,
              reduceAdd,
              reduceRemove,
              reduceInitial,
              update = crossfilter_null,
              reset = crossfilter_null,
              resetNeeded = true,
              groupAll = key === crossfilter_null;

          if (arguments.length < 1) key = crossfilter_identity;

          // The group listens to the crossfilter for when any dimension changes, so
          // that it can update the associated reduce values. It must also listen to
          // the parent dimension for when data is added, and compute new keys.
          filterListeners.push(update);
          indexListeners.push(add);
          removeDataListeners.push(removeData);

          // Incorporate any existing data into the grouping.
          add(values, index, 0, n);

          // Incorporates the specified new values into this group.
          // This function is responsible for updating groups and groupIndex.
          function add(newValues, newIndex, n0, n1) {
            var oldGroups = groups,
                reIndex = crossfilter_index(k, groupCapacity),
                add = reduceAdd,
                initial = reduceInitial,
                k0 = k, // old cardinality
                i0 = 0, // index of old group
                i1 = 0, // index of new record
                j, // object id
                g0, // old group
                x0, // old key
                x1, // new key
                g, // group to add
                x; // key of group to add

            // If a reset is needed, we don't need to update the reduce values.
            if (resetNeeded) add = initial = crossfilter_null;

            // Reset the new groups (k is a lower bound).
            // Also, make sure that groupIndex exists and is long enough.
            groups = new Array(k), k = 0;
            groupIndex = k0 > 1 ? crossfilter_arrayLengthen(groupIndex, n) : crossfilter_index(n, groupCapacity);

            // Get the first old key (x0 of g0), if it exists.
            if (k0) x0 = (g0 = oldGroups[0]).key;

            // Find the first new key (x1), skipping NaN keys.
            while (i1 < n1 && !((x1 = key(newValues[i1])) >= x1)) ++i1;

            // While new keys remain…
            while (i1 < n1) {

              // Determine the lesser of the two current keys; new and old.
              // If there are no old keys remaining, then always add the new key.
              if (g0 && x0 <= x1) {
                g = g0, x = x0;

                // Record the new index of the old group.
                reIndex[i0] = k;

                // Retrieve the next old key.
                if (g0 = oldGroups[++i0]) x0 = g0.key;
              } else {
                g = {key: x1, value: initial()}, x = x1;
              }

              // Add the lesser group.
              groups[k] = g;

              // Add any selected records belonging to the added group, while
              // advancing the new key and populating the associated group index.
              while (!(x1 > x)) {
                groupIndex[j = newIndex[i1] + n0] = k;
                if (!(filters[j] & zero)) g.value = add(g.value, data[j]);
                if (++i1 >= n1) break;
                x1 = key(newValues[i1]);
              }

              groupIncrement();
            }

            // Add any remaining old groups that were greater than all new keys.
            // No incremental reduce is needed; these groups have no new records.
            // Also record the new index of the old group.
            while (i0 < k0) {
              groups[reIndex[i0] = k] = oldGroups[i0++];
              groupIncrement();
            }

            // If we added any new groups before any old groups,
            // update the group index of all the old records.
            if (k > i0) for (i0 = 0; i0 < n0; ++i0) {
              groupIndex[i0] = reIndex[groupIndex[i0]];
            }

            // Modify the update and reset behavior based on the cardinality.
            // If the cardinality is less than or equal to one, then the groupIndex
            // is not needed. If the cardinality is zero, then there are no records
            // and therefore no groups to update or reset. Note that we also must
            // change the registered listener to point to the new method.
            j = filterListeners.indexOf(update);
            if (k > 1) {
              update = updateMany;
              reset = resetMany;
            } else {
              if (!k && groupAll) {
                k = 1;
                groups = [{key: null, value: initial()}];
              }
              if (k === 1) {
                update = updateOne;
                reset = resetOne;
              } else {
                update = crossfilter_null;
                reset = crossfilter_null;
              }
              groupIndex = null;
            }
            filterListeners[j] = update;

            // Count the number of added groups,
            // and widen the group index as needed.
            function groupIncrement() {
              if (++k === groupCapacity) {
                reIndex = crossfilter_arrayWiden(reIndex, groupWidth <<= 1);
                groupIndex = crossfilter_arrayWiden(groupIndex, groupWidth);
                groupCapacity = crossfilter_capacity(groupWidth);
              }
            }
          }

          function removeData() {
            if (k > 1) {
              var oldK = k,
                  oldGroups = groups,
                  seenGroups = crossfilter_index(oldK, oldK);

              // Filter out non-matches by copying matching group index entries to
              // the beginning of the array.
              for (var i = 0, j = 0; i < n; ++i) {
                if (filters[i]) {
                  seenGroups[groupIndex[j] = groupIndex[i]] = 1;
                  ++j;
                }
              }

              // Reassemble groups including only those groups that were referred
              // to by matching group index entries.  Note the new group index in
              // seenGroups.
              groups = [], k = 0;
              for (i = 0; i < oldK; ++i) {
                if (seenGroups[i]) {
                  seenGroups[i] = k++;
                  groups.push(oldGroups[i]);
                }
              }

              if (k > 1) {
                // Reindex the group index using seenGroups to find the new index.
                for (var i = 0; i < j; ++i) groupIndex[i] = seenGroups[groupIndex[i]];
              } else {
                groupIndex = null;
              }
              filterListeners[filterListeners.indexOf(update)] = k > 1
                  ? (reset = resetMany, update = updateMany)
                  : k === 1 ? (reset = resetOne, update = updateOne)
                  : reset = update = crossfilter_null;
            } else if (k === 1) {
              if (groupAll) return;
              for (var i = 0; i < n; ++i) if (filters[i]) return;
              groups = [], k = 0;
              filterListeners[filterListeners.indexOf(update)] =
              update = reset = crossfilter_null;
            }
          }

          // Reduces the specified selected or deselected records.
          // This function is only used when the cardinality is greater than 1.
          function updateMany(filterOne, added, removed) {
            if (filterOne === one || resetNeeded) return;

            var i,
                k,
                n,
                g;

            // Add the added values.
            for (i = 0, n = added.length; i < n; ++i) {
              if (!(filters[k = added[i]] & zero)) {
                g = groups[groupIndex[k]];
                g.value = reduceAdd(g.value, data[k]);
              }
            }

            // Remove the removed values.
            for (i = 0, n = removed.length; i < n; ++i) {
              if ((filters[k = removed[i]] & zero) === filterOne) {
                g = groups[groupIndex[k]];
                g.value = reduceRemove(g.value, data[k]);
              }
            }
          }

          // Reduces the specified selected or deselected records.
          // This function is only used when the cardinality is 1.
          function updateOne(filterOne, added, removed) {
            if (filterOne === one || resetNeeded) return;

            var i,
                k,
                n,
                g = groups[0];

            // Add the added values.
            for (i = 0, n = added.length; i < n; ++i) {
              if (!(filters[k = added[i]] & zero)) {
                g.value = reduceAdd(g.value, data[k]);
              }
            }

            // Remove the removed values.
            for (i = 0, n = removed.length; i < n; ++i) {
              if ((filters[k = removed[i]] & zero) === filterOne) {
                g.value = reduceRemove(g.value, data[k]);
              }
            }
          }

          // Recomputes the group reduce values from scratch.
          // This function is only used when the cardinality is greater than 1.
          function resetMany() {
            var i,
                g;

            // Reset all group values.
            for (i = 0; i < k; ++i) {
              groups[i].value = reduceInitial();
            }

            // Add any selected records.
            for (i = 0; i < n; ++i) {
              if (!(filters[i] & zero)) {
                g = groups[groupIndex[i]];
                g.value = reduceAdd(g.value, data[i]);
              }
            }
          }

          // Recomputes the group reduce values from scratch.
          // This function is only used when the cardinality is 1.
          function resetOne() {
            var i,
                g = groups[0];

            // Reset the singleton group values.
            g.value = reduceInitial();

            // Add any selected records.
            for (i = 0; i < n; ++i) {
              if (!(filters[i] & zero)) {
                g.value = reduceAdd(g.value, data[i]);
              }
            }
          }

          // Returns the array of group values, in the dimension's natural order.
          function all() {
            if (resetNeeded) reset(), resetNeeded = false;
            return groups;
          }

          // Returns a new array containing the top K group values, in reduce order.
          function top(k) {
            var top = select(all(), 0, groups.length, k);
            return heap.sort(top, 0, top.length);
          }

          // Sets the reduce behavior for this group to use the specified functions.
          // This method lazily recomputes the reduce values, waiting until needed.
          function reduce(add, remove, initial) {
            reduceAdd = add;
            reduceRemove = remove;
            reduceInitial = initial;
            resetNeeded = true;
            return group;
          }

          // A convenience method for reducing by count.
          function reduceCount() {
            return reduce(crossfilter_reduceIncrement, crossfilter_reduceDecrement, crossfilter_zero);
          }

          // A convenience method for reducing by sum(value).
          function reduceSum(value) {
            return reduce(crossfilter_reduceAdd(value), crossfilter_reduceSubtract(value), crossfilter_zero);
          }

          // Sets the reduce order, using the specified accessor.
          function order(value) {
            select = heapselect_by(valueOf);
            heap = heap_by(valueOf);
            function valueOf(d) { return value(d.value); }
            return group;
          }

          // A convenience method for natural ordering by reduce value.
          function orderNatural() {
            return order(crossfilter_identity);
          }

          // Returns the cardinality of this group, irrespective of any filters.
          function size() {
            return k;
          }

          // Removes this group and associated event listeners.
          function dispose() {
            var i = filterListeners.indexOf(update);
            if (i >= 0) filterListeners.splice(i, 1);
            i = indexListeners.indexOf(add);
            if (i >= 0) indexListeners.splice(i, 1);
            i = removeDataListeners.indexOf(removeData);
            if (i >= 0) removeDataListeners.splice(i, 1);
            return group;
          }

          return reduceCount().orderNatural();
        }

        // A convenience function for generating a singleton group.
        function groupAll() {
          var g = group(crossfilter_null), all = g.all;
          delete g.all;
          delete g.top;
          delete g.order;
          delete g.orderNatural;
          delete g.size;
          g.value = function() { return all()[0].value; };
          return g;
        }

        // Removes this dimension and associated groups and event listeners.
        function dispose() {
          dimensionGroups.forEach(function(group) { group.dispose(); });
          var i = dataListeners.indexOf(preAdd);
          if (i >= 0) dataListeners.splice(i, 1);
          i = dataListeners.indexOf(postAdd);
          if (i >= 0) dataListeners.splice(i, 1);
          i = removeDataListeners.indexOf(removeData);
          if (i >= 0) removeDataListeners.splice(i, 1);
          m &= zero;
          return filterAll();
        }

        return dimension;
      }

      // A convenience method for groupAll on a dummy dimension.
      // This implementation can be optimized since it always has cardinality 1.
      function groupAll() {
        var group = {
          reduce: reduce,
          reduceCount: reduceCount,
          reduceSum: reduceSum,
          value: value,
          dispose: dispose,
          remove: dispose // for backwards-compatibility
        };

        var reduceValue,
            reduceAdd,
            reduceRemove,
            reduceInitial,
            resetNeeded = true;

        // The group listens to the crossfilter for when any dimension changes, so
        // that it can update the reduce value. It must also listen to the parent
        // dimension for when data is added.
        filterListeners.push(update);
        dataListeners.push(add);

        // For consistency; actually a no-op since resetNeeded is true.
        add(data, 0);

        // Incorporates the specified new values into this group.
        function add(newData, n0) {
          var i;

          if (resetNeeded) return;

          // Add the added values.
          for (i = n0; i < n; ++i) {
            if (!filters[i]) {
              reduceValue = reduceAdd(reduceValue, data[i]);
            }
          }
        }

        // Reduces the specified selected or deselected records.
        function update(filterOne, added, removed) {
          var i,
              k,
              n;

          if (resetNeeded) return;

          // Add the added values.
          for (i = 0, n = added.length; i < n; ++i) {
            if (!filters[k = added[i]]) {
              reduceValue = reduceAdd(reduceValue, data[k]);
            }
          }

          // Remove the removed values.
          for (i = 0, n = removed.length; i < n; ++i) {
            if (filters[k = removed[i]] === filterOne) {
              reduceValue = reduceRemove(reduceValue, data[k]);
            }
          }
        }

        // Recomputes the group reduce value from scratch.
        function reset() {
          var i;

          reduceValue = reduceInitial();

          for (i = 0; i < n; ++i) {
            if (!filters[i]) {
              reduceValue = reduceAdd(reduceValue, data[i]);
            }
          }
        }

        // Sets the reduce behavior for this group to use the specified functions.
        // This method lazily recomputes the reduce value, waiting until needed.
        function reduce(add, remove, initial) {
          reduceAdd = add;
          reduceRemove = remove;
          reduceInitial = initial;
          resetNeeded = true;
          return group;
        }

        // A convenience method for reducing by count.
        function reduceCount() {
          return reduce(crossfilter_reduceIncrement, crossfilter_reduceDecrement, crossfilter_zero);
        }

        // A convenience method for reducing by sum(value).
        function reduceSum(value) {
          return reduce(crossfilter_reduceAdd(value), crossfilter_reduceSubtract(value), crossfilter_zero);
        }

        // Returns the computed reduce value.
        function value() {
          if (resetNeeded) reset(), resetNeeded = false;
          return reduceValue;
        }

        // Removes this group and associated event listeners.
        function dispose() {
          var i = filterListeners.indexOf(update);
          if (i >= 0) filterListeners.splice(i);
          i = dataListeners.indexOf(add);
          if (i >= 0) dataListeners.splice(i);
          return group;
        }

        return reduceCount();
      }

      // Returns the number of records in this crossfilter, irrespective of any filters.
      function size() {
        return n;
      }

      return arguments.length
          ? add(arguments[0])
          : crossfilter;
    }

    // Returns an array of size n, big enough to store ids up to m.
    function crossfilter_index(n, m) {
      return (m < 0x101
          ? crossfilter_array8 : m < 0x10001
          ? crossfilter_array16
          : crossfilter_array32)(n);
    }

    // Constructs a new array of size n, with sequential values from 0 to n - 1.
    function crossfilter_range(n) {
      var range = crossfilter_index(n, n);
      for (var i = -1; ++i < n;) range[i] = i;
      return range;
    }

    function crossfilter_capacity(w) {
      return w === 8
          ? 0x100 : w === 16
          ? 0x10000
          : 0x100000000;
    }
    })(exports || commonjsGlobal);
    });

    var crossfilter = crossfilter$1.crossfilter;

    var jsonToPivotjson = function (data, options) {
    			
    	var ndx = crossfilter(data); 

    	var pivotCol = options.column;
    	var pivotVal = options.value;
    	var pivotRow = options.row; 

    	var out = []; 

    	var pivotRowDimension = ndx.dimension(function(d){
    		return d[pivotRow];
    	});

    	var pivotColDimension = ndx.dimension(function(d){
    		return d[pivotCol];
    	});

    	var totalByPivotRow = pivotRowDimension.group().reduceSum(function(d){ 		
    		return d[pivotVal]
    	});

    	var allRecs = totalByPivotRow.all();

    	allRecs.forEach(function(rec){
    		
    		pivotRowDimension.filter();
    		pivotRowDimension.filter(rec.key);
    		
    		var totalByPivotCol = pivotColDimension.group().reduceSum(function(d){ 		
    			return d[pivotVal]
    		});

    		var data = totalByPivotCol.all(); 
    		
    		var doc = {}; 
    		
    		doc[pivotRow] = rec.key; 
    		
    		data.forEach(function(d){
    			doc[d.key] = d.value; 
    		});
    		
    		out.push(doc);
    	});

    	return out;
    };


    var jsonToPivotJson = jsonToPivotjson;

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const race = writable([]);

    const currentRace = writable(0);

    const oddsCal = writable(0);

    const calDate = writable(0);

    const inputs = writable([]);

    const roptions = writable([]);




    function Get(theUrl) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false); // false for synchronous request
        xmlHttp.send(null);
        return xmlHttp.responseText;
    }





    const getData = () => {

        let resp = Get('https://utxnaxbctngt41y-gra.adb.uk-london-1.oraclecloudapps.com/ords/gra/races/file/is.json');
        let resJson = JSON.parse(resp);
        roptions.set(resJson);
        calDate.set(resJson[0].r);

    };


    function getTData() {
        let calendarDate;
        calDate.subscribe(v => { calendarDate = v; });
        let cRace;
        currentRace.subscribe(v => cRace = v);
        let resp = Get(`https://utxnaxbctngt41y-gra.adb.uk-london-1.oraclecloudapps.com/ords/gra/races/odds?meet=${calendarDate}`);
        let resJson = JSON.parse(resp);
        inputs.set(resJson.items);
        race.set(resJson.items.map((rc, i) => {
            return rc['race_no']

        }));
        if (cRace == 0) {
            race.subscribe(v => {
                currentRace.set(v[0]);
            });

        }

    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * amount}px);`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\components\buttonGroup.svelte generated by Svelte v3.43.1 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (42:4) {:else}
    function create_else_block$2(ctx) {
    	let button;
    	let t0_value = /*item*/ ctx[3] + "";
    	let t0;
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();

    			attr(button, "class", button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " roundeds" + " svelte-16yaimb"));

    			attr(button, "type", "button");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t0);
    			append(button, t1);

    			if (!mounted) {
    				dispose = listen(button, "click", function () {
    					if (is_function(/*setRace*/ ctx[2](/*item*/ ctx[3]))) /*setRace*/ ctx[2](/*item*/ ctx[3]).apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$race*/ 1 && t0_value !== (t0_value = /*item*/ ctx[3] + "")) set_data(t0, t0_value);

    			if (dirty & /*$currentRace, $race*/ 3 && button_class_value !== (button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " roundeds" + " svelte-16yaimb"))) {
    				attr(button, "class", button_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (32:30) 
    function create_if_block_2$2(ctx) {
    	let button;
    	let t0_value = /*item*/ ctx[3] + "";
    	let t0;
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();

    			attr(button, "class", button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " rounded-l" + " svelte-16yaimb"));

    			attr(button, "type", "button");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t0);
    			append(button, t1);

    			if (!mounted) {
    				dispose = listen(button, "click", function () {
    					if (is_function(/*setRace*/ ctx[2](/*item*/ ctx[3]))) /*setRace*/ ctx[2](/*item*/ ctx[3]).apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$race*/ 1 && t0_value !== (t0_value = /*item*/ ctx[3] + "")) set_data(t0, t0_value);

    			if (dirty & /*$currentRace, $race*/ 3 && button_class_value !== (button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " rounded-l" + " svelte-16yaimb"))) {
    				attr(button, "class", button_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (21:36) 
    function create_if_block_1$2(ctx) {
    	let button;
    	let t0_value = /*item*/ ctx[3] + "";
    	let t0;
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();

    			attr(button, "class", button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " rounded-r" + " svelte-16yaimb"));

    			attr(button, "type", "button");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t0);
    			append(button, t1);

    			if (!mounted) {
    				dispose = listen(button, "click", function () {
    					if (is_function(/*setRace*/ ctx[2](/*item*/ ctx[3]))) /*setRace*/ ctx[2](/*item*/ ctx[3]).apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$race*/ 1 && t0_value !== (t0_value = /*item*/ ctx[3] + "")) set_data(t0, t0_value);

    			if (dirty & /*$currentRace, $race*/ 3 && button_class_value !== (button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " rounded-r" + " svelte-16yaimb"))) {
    				attr(button, "class", button_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (12:4) {#if $race.length == 1 }
    function create_if_block$2(ctx) {
    	let button;
    	let t0_value = /*item*/ ctx[3] + "";
    	let t0;
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();

    			attr(button, "class", button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " rounded" + " svelte-16yaimb"));

    			attr(button, "type", "button");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t0);
    			append(button, t1);

    			if (!mounted) {
    				dispose = listen(button, "click", function () {
    					if (is_function(/*setRace*/ ctx[2](/*item*/ ctx[3]))) /*setRace*/ ctx[2](/*item*/ ctx[3]).apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$race*/ 1 && t0_value !== (t0_value = /*item*/ ctx[3] + "")) set_data(t0, t0_value);

    			if (dirty & /*$currentRace, $race*/ 3 && button_class_value !== (button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " rounded" + " svelte-16yaimb"))) {
    				attr(button, "class", button_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (11:4) {#each $race as item}
    function create_each_block$2(ctx) {
    	let show_if;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*$race*/ ctx[0].length == 1) return create_if_block$2;
    		if (show_if == null || dirty & /*$race*/ 1) show_if = !!(/*$race*/ ctx[0].at(-1) == /*item*/ ctx[3]);
    		if (show_if) return create_if_block_1$2;
    		if (/*$race*/ ctx[0][0] == /*item*/ ctx[3]) return create_if_block_2$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	let each_1_anchor;
    	let each_value = /*$race*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*$currentRace, $race, setRace*/ 7) {
    				each_value = /*$race*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $race;
    	let $currentRace;
    	component_subscribe($$self, race, $$value => $$invalidate(0, $race = $$value));
    	component_subscribe($$self, currentRace, $$value => $$invalidate(1, $currentRace = $$value));

    	function setRace(raceNo) {
    		currentRace.set(raceNo);
    	}

    	return [$race, $currentRace, setRace];
    }

    class ButtonGroup extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, {});
    	}
    }

    /* src\components\oddsCal.svelte generated by Svelte v3.43.1 */

    function create_fragment$3(ctx) {
    	let div;
    	let button0;
    	let t0;
    	let button0_class_value;
    	let t1;
    	let button1;
    	let t2;
    	let button1_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			button0 = element("button");
    			t0 = text("f100");
    			t1 = space();
    			button1 = element("button");
    			t2 = text("f500");
    			attr(button0, "class", button0_class_value = "" + ((/*$oddsCal*/ ctx[0] == false ? 'active' : '') + " rounded-l" + " svelte-12qrkab"));
    			attr(button0, "type", "button");
    			attr(button1, "class", button1_class_value = "" + ((/*$oddsCal*/ ctx[0] == true ? 'active' : '') + " rounded-r" + " svelte-12qrkab"));
    			attr(button1, "type", "button");
    			attr(div, "class", "bGroup2 flex relative items-center justify-center mb-4");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, button0);
    			append(button0, t0);
    			append(div, t1);
    			append(div, button1);
    			append(button1, t2);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*click_handler*/ ctx[1]),
    					listen(button1, "click", /*click_handler_1*/ ctx[2])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*$oddsCal*/ 1 && button0_class_value !== (button0_class_value = "" + ((/*$oddsCal*/ ctx[0] == false ? 'active' : '') + " rounded-l" + " svelte-12qrkab"))) {
    				attr(button0, "class", button0_class_value);
    			}

    			if (dirty & /*$oddsCal*/ 1 && button1_class_value !== (button1_class_value = "" + ((/*$oddsCal*/ ctx[0] == true ? 'active' : '') + " rounded-r" + " svelte-12qrkab"))) {
    				attr(button1, "class", button1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $oddsCal;
    	component_subscribe($$self, oddsCal, $$value => $$invalidate(0, $oddsCal = $$value));
    	const click_handler = () => oddsCal.set(false);
    	const click_handler_1 = () => oddsCal.set(true);
    	return [$oddsCal, click_handler, click_handler_1];
    }

    class OddsCal extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, {});
    	}
    }

    /* src\components\CompareOdds.svelte generated by Svelte v3.43.1 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	child_ctx[28] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	child_ctx[28] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	return child_ctx;
    }

    // (68:0) {#if show}
    function create_if_block_6(ctx) {
    	let div1;
    	let div0;
    	let h3;
    	let h3_intro;
    	let t1;
    	let svg;
    	let g0;
    	let circle;
    	let path0;
    	let polygon0;
    	let polygon1;
    	let polygon2;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let ellipse0;
    	let polygon3;
    	let polygon4;
    	let polygon5;
    	let path9;
    	let path10;
    	let path11;
    	let path12;
    	let path13;
    	let path14;
    	let path15;
    	let path16;
    	let ellipse1;
    	let g1;
    	let g2;
    	let g3;
    	let g4;
    	let g5;
    	let g6;
    	let g7;
    	let g8;
    	let g9;
    	let g10;
    	let g11;
    	let g12;
    	let g13;
    	let g14;
    	let g15;
    	let svg_intro;
    	let t2;
    	let h40;
    	let t3;
    	let h40_intro;
    	let t4;
    	let h41;
    	let t5;
    	let h41_intro;
    	let t6;
    	let input_1;
    	let input_1_intro;
    	let t7;
    	let h50;
    	let h50_intro;
    	let t9;
    	let h51;
    	let show_if;
    	let h51_intro;
    	let t10;
    	let button;
    	let button_intro;
    	let div0_intro;
    	let div0_outro;
    	let div1_intro;
    	let div1_outro;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty[0] & /*bet, selectedOdds*/ 34) show_if = !!isNaN(/*bet*/ ctx[1] * /*selectedOdds*/ ctx[5] / 100);
    		if (show_if) return create_if_block_7;
    		return create_else_block_5;
    	}

    	let current_block_type = select_block_type(ctx, [-1, -1]);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Betting Calculator";
    			t1 = space();
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			circle = svg_element("circle");
    			path0 = svg_element("path");
    			polygon0 = svg_element("polygon");
    			polygon1 = svg_element("polygon");
    			polygon2 = svg_element("polygon");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			ellipse0 = svg_element("ellipse");
    			polygon3 = svg_element("polygon");
    			polygon4 = svg_element("polygon");
    			polygon5 = svg_element("polygon");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			path12 = svg_element("path");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			ellipse1 = svg_element("ellipse");
    			g1 = svg_element("g");
    			g2 = svg_element("g");
    			g3 = svg_element("g");
    			g4 = svg_element("g");
    			g5 = svg_element("g");
    			g6 = svg_element("g");
    			g7 = svg_element("g");
    			g8 = svg_element("g");
    			g9 = svg_element("g");
    			g10 = svg_element("g");
    			g11 = svg_element("g");
    			g12 = svg_element("g");
    			g13 = svg_element("g");
    			g14 = svg_element("g");
    			g15 = svg_element("g");
    			t2 = space();
    			h40 = element("h4");
    			t3 = text(/*selectedBookie*/ ctx[4]);
    			t4 = space();
    			h41 = element("h4");
    			t5 = text(/*selectedHorse*/ ctx[3]);
    			t6 = space();
    			input_1 = element("input");
    			t7 = space();
    			h50 = element("h5");
    			h50.textContent = "Payout:";
    			t9 = space();
    			h51 = element("h5");
    			if_block.c();
    			t10 = space();
    			button = element("button");
    			button.textContent = "ok";
    			attr(h3, "class", "svelte-1l03gy");
    			set_style(circle, "fill", "#419c2c21");
    			attr(circle, "cx", "256");
    			attr(circle, "cy", "256");
    			attr(circle, "r", "256");
    			set_style(path0, "fill", "rgba(98, 126, 105,0.5)");
    			attr(path0, "d", "M493.297,352.061l-0.553-0.276L289.065,135.808l-96.123-48.061l-96.123,48.061V259.2\r\n   l120.909,119.711l8.54,24.94l90.788,100.772C397.348,484.961,462.74,427.459,493.297,352.061z");
    			set_style(polygon0, "fill", "#04ad0c");
    			attr(polygon0, "points", "289.065,135.808 192.942,183.875 96.819,135.808 192.942,87.747 \t");
    			set_style(polygon1, "fill", "#04ad0c");
    			attr(polygon1, "points", "192.942,306.278 96.819,259.2 96.819,135.808 192.942,183.875 \t");
    			set_style(polygon2, "fill", "#006b05");
    			attr(polygon2, "points", "192.942,306.278 289.065,259.2 289.065,135.808 192.942,183.875 \t");
    			set_style(path1, "fill", "#FFFFFF");
    			attr(path1, "d", "M153.882,221.379c0,6.733-4.029,10.706-9.001,8.873c-4.972-1.833-9.001-8.781-9.001-15.514\r\n   c0-6.733,4.029-10.706,9.001-8.873C149.852,207.703,153.882,214.646,153.882,221.379z");
    			set_style(path2, "fill", "#FFFFFF");
    			attr(path2, "d", "M234.813,222.74c0,6.733,4.029,10.706,9.001,8.873c4.972-1.833,9.001-8.781,9.001-15.514\r\n   c0-6.733-4.029-10.706-9.001-8.873C238.843,209.065,234.813,216.008,234.813,222.74z");
    			set_style(path3, "fill", "#FFFFFF");
    			attr(path3, "d", "M205.553,205.768c0,6.733,4.029,10.706,9.001,8.873s9.001-8.781,9.001-15.514\r\n   s-4.029-10.706-9.001-8.873S205.553,199.035,205.553,205.768z");
    			set_style(path4, "fill", "#FFFFFF");
    			attr(path4, "d", "M205.553,272.256c0,6.733,4.029,10.706,9.001,8.873c4.972-1.833,9.001-8.781,9.001-15.514\r\n   s-4.029-10.706-9.001-8.873S205.553,265.523,205.553,272.256z");
    			set_style(path5, "fill", "#FFFFFF");
    			attr(path5, "d", "M260.465,178.693c0,6.733,4.029,10.706,9.001,8.873s9.001-8.781,9.001-15.514\r\n   c0-6.733-4.029-10.706-9.001-8.873C264.499,165.012,260.465,171.955,260.465,178.693z");
    			set_style(path6, "fill", "#FFFFFF");
    			attr(path6, "d", "M260.465,245.181c0,6.733,4.029,10.706,9.001,8.873c4.972-1.833,9.001-8.781,9.001-15.514\r\n   s-4.029-10.706-9.001-8.873S260.465,238.449,260.465,245.181z");
    			set_style(path7, "fill", "#FFFFFF");
    			attr(path7, "d", "M123.571,176.292c0,6.733-4.029,10.706-9.001,8.873c-4.972-1.833-9.001-8.781-9.001-15.514\r\n   c0-6.733,4.029-10.706,9.001-8.873C119.542,162.611,123.571,169.559,123.571,176.292z");
    			set_style(path8, "fill", "#FFFFFF");
    			attr(path8, "d", "M180.122,270.459c0,6.733-4.029,10.706-9.001,8.873c-4.972-1.833-9.001-8.781-9.001-15.514\r\n   c0-6.733,4.029-10.706,9.001-8.873C176.092,256.783,180.122,263.726,180.122,270.459z");
    			set_style(ellipse0, "fill", "#FFFFFF");
    			attr(ellipse0, "cx", "192.942");
    			attr(ellipse0, "cy", "135.808");
    			attr(ellipse0, "rx", "12.611");
    			attr(ellipse0, "ry", "8.53");
    			set_style(polygon3, "fill", "#009708");
    			attr(polygon3, "points", "414.776,351.278 312.822,317.292 278.835,215.337 380.79,249.324 \t");
    			set_style(polygon4, "fill", "#04ad0c");
    			attr(polygon4, "points", "226.263,403.845 191.585,302.587 278.835,215.337 312.822,317.292 \t");
    			set_style(polygon5, "fill", "#006b05");
    			attr(polygon5, "points", "226.263,403.845 327.526,438.528 414.776,351.278 312.822,317.292 \t");
    			set_style(path9, "fill", "#FFFFFF");
    			attr(path9, "d", "M306.253,341.693c-4.762,4.762-4.721,10.419,0.092,12.641c4.813,2.217,12.575,0.159,17.336-4.603\r\n   c4.762-4.762,4.721-10.419-0.092-12.641S311.014,336.932,306.253,341.693z");
    			set_style(path10, "fill", "#FFFFFF");
    			attr(path10, "d", "M259.236,388.705c-4.762,4.762-4.721,10.419,0.092,12.641c4.813,2.217,12.575,0.159,17.336-4.603\r\n   c4.762-4.762,4.721-10.419-0.092-12.641C271.759,381.88,263.997,383.944,259.236,388.705z");
    			set_style(path11, "fill", "#FFFFFF");
    			attr(path11, "d", "M336.599,351.862c-4.762,4.762-4.721,10.419,0.092,12.641c4.813,2.222,12.575,0.159,17.336-4.603\r\n   s4.721-10.419-0.092-12.641C349.123,345.037,341.361,347.1,336.599,351.862z");
    			set_style(path12, "fill", "#FFFFFF");
    			attr(path12, "d", "M289.582,398.879c-4.762,4.762-4.721,10.419,0.092,12.641c4.813,2.217,12.575,0.159,17.336-4.603\r\n   c4.762-4.762,4.721-10.419-0.092-12.641S294.344,394.117,289.582,398.879z");
    			set_style(path13, "fill", "#FFFFFF");
    			attr(path13, "d", "M364.232,361.375c-4.762,4.762-4.721,10.419,0.092,12.641c4.813,2.217,12.575,0.159,17.336-4.603\r\n   s4.721-10.419-0.092-12.641C376.755,354.555,368.993,356.613,364.232,361.375z");
    			set_style(path14, "fill", "#FFFFFF");
    			attr(path14, "d", "M317.215,408.392c-4.762,4.762-4.721,10.419,0.092,12.641c4.813,2.217,12.575,0.159,17.336-4.603\r\n   c4.762-4.762,4.721-10.419-0.092-12.641C329.738,401.567,321.976,403.63,317.215,408.392z");
    			set_style(path15, "fill", "#FFFFFF");
    			attr(path15, "d", "M269.128,262.881c-4.762,4.762-10.419,4.721-12.641-0.092c-2.217-4.813-0.159-12.575,4.603-17.336\r\n   c4.762-4.762,10.419-4.721,12.641,0.092C275.953,250.358,273.889,258.12,269.128,262.881z");
    			set_style(path16, "fill", "#FFFFFF");
    			attr(path16, "d", "M242.529,369.454c-4.762,4.762-10.419,4.721-12.641-0.092c-2.217-4.813-0.159-12.575,4.603-17.336\r\n   s10.419-4.721,12.641,0.092S247.291,364.692,242.529,369.454z");
    			attr(ellipse1, "transform", "matrix(0.7071 -0.7071 0.7071 0.7071 -98.7293 328.1921)");
    			set_style(ellipse1, "fill", "#FFFFFF");
    			attr(ellipse1, "cx", "346.798");
    			attr(ellipse1, "cy", "283.273");
    			attr(ellipse1, "rx", "8.53");
    			attr(ellipse1, "ry", "12.61");
    			attr(svg, "version", "1.1");
    			attr(svg, "id", "Layer_1");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr(svg, "x", "0px");
    			attr(svg, "y", "0px");
    			attr(svg, "viewBox", "0 0 512 512");
    			set_style(svg, "enable-background", "new 0 0 512 512");
    			attr(svg, "xml:space", "preserve");
    			attr(svg, "class", "svelte-1l03gy");
    			attr(input_1, "class", "bet svelte-1l03gy");
    			attr(input_1, "type", "number");
    			attr(input_1, "placeholder", "Bet");
    			attr(button, "class", "rounded svelte-1l03gy");
    			attr(button, "type", "button");
    			attr(div0, "class", "betCalc svelte-1l03gy");
    			attr(div1, "class", "overlay svelte-1l03gy");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h3);
    			append(div0, t1);
    			append(div0, svg);
    			append(svg, g0);
    			append(g0, circle);
    			append(g0, path0);
    			append(g0, polygon0);
    			append(g0, polygon1);
    			append(g0, polygon2);
    			append(g0, path1);
    			append(g0, path2);
    			append(g0, path3);
    			append(g0, path4);
    			append(g0, path5);
    			append(g0, path6);
    			append(g0, path7);
    			append(g0, path8);
    			append(g0, ellipse0);
    			append(g0, polygon3);
    			append(g0, polygon4);
    			append(g0, polygon5);
    			append(g0, path9);
    			append(g0, path10);
    			append(g0, path11);
    			append(g0, path12);
    			append(g0, path13);
    			append(g0, path14);
    			append(g0, path15);
    			append(g0, path16);
    			append(g0, ellipse1);
    			append(svg, g1);
    			append(svg, g2);
    			append(svg, g3);
    			append(svg, g4);
    			append(svg, g5);
    			append(svg, g6);
    			append(svg, g7);
    			append(svg, g8);
    			append(svg, g9);
    			append(svg, g10);
    			append(svg, g11);
    			append(svg, g12);
    			append(svg, g13);
    			append(svg, g14);
    			append(svg, g15);
    			append(div0, t2);
    			append(div0, h40);
    			append(h40, t3);
    			append(div0, t4);
    			append(div0, h41);
    			append(h41, t5);
    			append(div0, t6);
    			append(div0, input_1);
    			set_input_value(input_1, /*bet*/ ctx[1]);
    			append(div0, t7);
    			append(div0, h50);
    			append(div0, t9);
    			append(div0, h51);
    			if_block.m(h51, null);
    			append(div0, t10);
    			append(div0, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input_1, "input", /*input_1_input_handler*/ ctx[17]),
    					listen(button, "click", /*click_handler_1*/ ctx[18]),
    					listen(div0, "click", stop_propagation(/*click_handler*/ ctx[16])),
    					listen(div1, "click", stop_propagation(prevent_default(/*click_handler_2*/ ctx[19])))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (!current || dirty[0] & /*selectedBookie*/ 16) set_data(t3, /*selectedBookie*/ ctx[4]);
    			if (!current || dirty[0] & /*selectedHorse*/ 8) set_data(t5, /*selectedHorse*/ ctx[3]);

    			if (dirty[0] & /*bet*/ 2 && to_number(input_1.value) !== /*bet*/ ctx[1]) {
    				set_input_value(input_1, /*bet*/ ctx[1]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(h51, null);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;

    			if (!h3_intro) {
    				add_render_callback(() => {
    					h3_intro = create_in_transition(h3, fly, { y: -50, duration: 2300 });
    					h3_intro.start();
    				});
    			}

    			if (!svg_intro) {
    				add_render_callback(() => {
    					svg_intro = create_in_transition(svg, fly, { y: -50, duration: 2500 });
    					svg_intro.start();
    				});
    			}

    			if (!h40_intro) {
    				add_render_callback(() => {
    					h40_intro = create_in_transition(h40, fly, { y: -50, duration: 2300 });
    					h40_intro.start();
    				});
    			}

    			if (!h41_intro) {
    				add_render_callback(() => {
    					h41_intro = create_in_transition(h41, fly, { y: 50, duration: 2300 });
    					h41_intro.start();
    				});
    			}

    			if (!input_1_intro) {
    				add_render_callback(() => {
    					input_1_intro = create_in_transition(input_1, fly, { y: 50, duration: 2300 });
    					input_1_intro.start();
    				});
    			}

    			if (!h50_intro) {
    				add_render_callback(() => {
    					h50_intro = create_in_transition(h50, fly, { y: 50, duration: 2300 });
    					h50_intro.start();
    				});
    			}

    			if (!h51_intro) {
    				add_render_callback(() => {
    					h51_intro = create_in_transition(h51, fly, { y: 50, duration: 2300 });
    					h51_intro.start();
    				});
    			}

    			if (!button_intro) {
    				add_render_callback(() => {
    					button_intro = create_in_transition(button, fly, { y: 50, duration: 2300 });
    					button_intro.start();
    				});
    			}

    			add_render_callback(() => {
    				if (div0_outro) div0_outro.end(1);
    				div0_intro = create_in_transition(div0, fly, { y: 100, duration: 1000 });
    				div0_intro.start();
    			});

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				div1_intro = create_in_transition(div1, blur, { y: 50, duration: 1000 });
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o(local) {
    			if (div0_intro) div0_intro.invalidate();
    			div0_outro = create_out_transition(div0, fly, { y: -100, duration: 1000 });
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, blur, { y: -50, duration: 1000 });
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if_block.d();
    			if (detaching && div0_outro) div0_outro.end();
    			if (detaching && div1_outro) div1_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (167:5) {:else}
    function create_else_block_5(ctx) {
    	let t_value = /*bet*/ ctx[1] * /*selectedOdds*/ ctx[5] / 100 + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*bet, selectedOdds*/ 34 && t_value !== (t_value = /*bet*/ ctx[1] * /*selectedOdds*/ ctx[5] / 100 + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (164:2) {#if isNaN( (bet * selectedOdds) / 100) }
    function create_if_block_7(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("0");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (181:0) {#if output}
    function create_if_block$1(ctx) {
    	let div2;
    	let select;
    	let t0;
    	let div0;
    	let buttongroup;
    	let t1;
    	let div1;
    	let oddscal;
    	let t2;
    	let div3;
    	let table;
    	let thead;
    	let tr;
    	let t3;
    	let tbody;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*$roptions*/ ctx[7]) return create_if_block_5;
    		return create_else_block_4;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);
    	buttongroup = new ButtonGroup({});
    	oddscal = new OddsCal({});
    	let each_value_2 = Object.keys(/*output*/ ctx[0][0]);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = Object.values(/*output*/ ctx[0]);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div2 = element("div");
    			select = element("select");
    			if_block.c();
    			t0 = space();
    			div0 = element("div");
    			create_component(buttongroup.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(oddscal.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(select, "class", "selectList svelte-1l03gy");
    			if (/*$calDate*/ ctx[6] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[20].call(select));
    			attr(div0, "class", "racebut svelte-1l03gy");
    			attr(div1, "class", "oddscal svelte-1l03gy");
    			attr(div2, "class", "caption svelte-1l03gy");
    			attr(div2, "id", "caption");
    			attr(table, "class", "oddstable svelte-1l03gy");
    			attr(div3, "class", "tWrap svelte-1l03gy");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, select);
    			if_block.m(select, null);
    			select_option(select, /*$calDate*/ ctx[6]);
    			append(div2, t0);
    			append(div2, div0);
    			mount_component(buttongroup, div0, null);
    			append(div2, t1);
    			append(div2, div1);
    			mount_component(oddscal, div1, null);
    			insert(target, t2, anchor);
    			insert(target, div3, anchor);
    			append(div3, table);
    			append(table, thead);
    			append(thead, tr);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append(table, t3);
    			append(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(select, "change", /*select_change_handler*/ ctx[20]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(select, null);
    				}
    			}

    			if (dirty[0] & /*$calDate, $roptions*/ 192) {
    				select_option(select, /*$calDate*/ ctx[6]);
    			}

    			if (dirty[0] & /*output*/ 1) {
    				each_value_2 = Object.keys(/*output*/ ctx[0][0]);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*output, jockey, horse, show, selectedBookie, selectedOdds, selectedHorse, $oddsCal*/ 1853) {
    				each_value = Object.values(/*output*/ ctx[0]);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(buttongroup.$$.fragment, local);
    			transition_in(oddscal.$$.fragment, local);

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			transition_out(buttongroup.$$.fragment, local);
    			transition_out(oddscal.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			if_block.d();
    			destroy_component(buttongroup);
    			destroy_component(oddscal);
    			if (detaching) detach(t2);
    			if (detaching) detach(div3);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (189:1) {:else}
    function create_else_block_4(ctx) {
    	let option;

    	return {
    		c() {
    			option = element("option");
    			option.textContent = "No Meetings";
    			option.__value = "";
    			option.value = option.__value;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (185:2) {#if $roptions}
    function create_if_block_5(ctx) {
    	let each_1_anchor;
    	let each_value_3 = /*$roptions*/ ctx[7];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*$roptions*/ 128) {
    				each_value_3 = /*$roptions*/ ctx[7];
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (186:1) {#each $roptions as opt}
    function create_each_block_3(ctx) {
    	let option;
    	let t_value = /*opt*/ ctx[31].race_date + "";
    	let t;
    	let option_value_value;

    	return {
    		c() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*opt*/ ctx[31].r;
    			option.value = option.__value;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*$roptions*/ 128 && t_value !== (t_value = /*opt*/ ctx[31].race_date + "")) set_data(t, t_value);

    			if (dirty[0] & /*$roptions*/ 128 && option_value_value !== (option_value_value = /*opt*/ ctx[31].r)) {
    				option.__value = option_value_value;
    				option.value = option.__value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (207:14) {:else}
    function create_else_block_3(ctx) {
    	let th;
    	let t_value = /*columnHeading*/ ctx[29] + "";
    	let t;
    	let th_intro;

    	return {
    		c() {
    			th = element("th");
    			t = text(t_value);
    			attr(th, "class", "py-3 px-6 text-center svelte-1l03gy");
    		},
    		m(target, anchor) {
    			insert(target, th, anchor);
    			append(th, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*output*/ 1 && t_value !== (t_value = /*columnHeading*/ ctx[29] + "")) set_data(t, t_value);
    		},
    		i(local) {
    			if (!th_intro) {
    				add_render_callback(() => {
    					th_intro = create_in_transition(th, blur, {});
    					th_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(th);
    		}
    	};
    }

    // (205:14) {#if i == 0}
    function create_if_block_4(ctx) {
    	let th;
    	let th_intro;

    	return {
    		c() {
    			th = element("th");
    			th.textContent = "Horse";
    			attr(th, "class", "py-3 px-6 text-center svelte-1l03gy");
    		},
    		m(target, anchor) {
    			insert(target, th, anchor);
    		},
    		p: noop,
    		i(local) {
    			if (!th_intro) {
    				add_render_callback(() => {
    					th_intro = create_in_transition(th, blur, {});
    					th_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(th);
    		}
    	};
    }

    // (203:8) {#each Object.keys(output[0]) as columnHeading , i}
    function create_each_block_2(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*i*/ ctx[28] == 0) return create_if_block_4;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		i(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (238:14) {:else}
    function create_else_block$1(ctx) {
    	let td;
    	let div;
    	let span;
    	let span_intro;
    	let mounted;
    	let dispose;

    	function select_block_type_4(ctx, dirty) {
    		if (/*$oddsCal*/ ctx[8] == true) return create_if_block_2$1;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_4(ctx);
    	let if_block = current_block_type(ctx);

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[21](/*i*/ ctx[28], /*cell*/ ctx[26], /*ii*/ ctx[25]);
    	}

    	return {
    		c() {
    			td = element("td");
    			div = element("div");
    			span = element("span");
    			if_block.c();
    			attr(span, "class", "font-medium ");
    			attr(div, "class", "block items-center");
    			attr(td, "class", "py-3 px-6 text-right whitespace-nowrap cursor-pointer hover:bg-gray-300 svelte-1l03gy");
    		},
    		m(target, anchor) {
    			insert(target, td, anchor);
    			append(td, div);
    			append(div, span);
    			if_block.m(span, null);

    			if (!mounted) {
    				dispose = listen(td, "click", click_handler_3);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		i(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, blur, {});
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(td);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (217:14) {#if i == 0}
    function create_if_block_1$1(ctx) {
    	let th;
    	let div2;
    	let div0;
    	let div0_intro;
    	let t0;
    	let div1;
    	let span0;
    	let t1_value = /*cell*/ ctx[26] + "";
    	let t1;
    	let t2;
    	let t3_value = /*horse*/ ctx[9](/*cell*/ ctx[26]) + "";
    	let t3;
    	let span0_intro;
    	let t4;
    	let span1;
    	let t5_value = /*jockey*/ ctx[10](/*cell*/ ctx[26]) + "";
    	let t5;
    	let span1_intro;

    	return {
    		c() {
    			th = element("th");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = text(". ");
    			t3 = text(t3_value);
    			t4 = space();
    			span1 = element("span");
    			t5 = text(t5_value);
    			attr(div0, "class", "mr-2");
    			attr(span0, "class", "font-medium svelte-1l03gy");
    			attr(span1, "class", "font-black text-xs mx-4 svelte-1l03gy");
    			attr(div1, "class", "horse svelte-1l03gy");
    			attr(div2, "class", "flex items-center");
    			attr(th, "class", "relative py-3 px-6 text-left whitespace-nowrap drop-shadow-lg svelte-1l03gy");
    		},
    		m(target, anchor) {
    			insert(target, th, anchor);
    			append(th, div2);
    			append(div2, div0);
    			append(div2, t0);
    			append(div2, div1);
    			append(div1, span0);
    			append(span0, t1);
    			append(span0, t2);
    			append(span0, t3);
    			append(div1, t4);
    			append(div1, span1);
    			append(span1, t5);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*output*/ 1 && t1_value !== (t1_value = /*cell*/ ctx[26] + "")) set_data(t1, t1_value);
    			if (dirty[0] & /*output*/ 1 && t3_value !== (t3_value = /*horse*/ ctx[9](/*cell*/ ctx[26]) + "")) set_data(t3, t3_value);
    			if (dirty[0] & /*output*/ 1 && t5_value !== (t5_value = /*jockey*/ ctx[10](/*cell*/ ctx[26]) + "")) set_data(t5, t5_value);
    		},
    		i(local) {
    			if (!div0_intro) {
    				add_render_callback(() => {
    					div0_intro = create_in_transition(div0, blur, {});
    					div0_intro.start();
    				});
    			}

    			if (!span0_intro) {
    				add_render_callback(() => {
    					span0_intro = create_in_transition(span0, blur, {});
    					span0_intro.start();
    				});
    			}

    			if (!span1_intro) {
    				add_render_callback(() => {
    					span1_intro = create_in_transition(span1, blur, {});
    					span1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(th);
    		}
    	};
    }

    // (260:26) {:else}
    function create_else_block_2(ctx) {
    	let t_value = /*cell*/ ctx[26] + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*output*/ 1 && t_value !== (t_value = /*cell*/ ctx[26] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (250:27) {#if $oddsCal == true}
    function create_if_block_2$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_5(ctx, dirty) {
    		if (/*cell*/ ctx[26] == 0) return create_if_block_3$1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_5(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (255:26) {:else}
    function create_else_block_1(ctx) {
    	let t_value = (100 / (/*cell*/ ctx[26] / 500)).toFixed(2) + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*output*/ 1 && t_value !== (t_value = (100 / (/*cell*/ ctx[26] / 500)).toFixed(2) + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (252:26) {#if cell == 0 }
    function create_if_block_3$1(ctx) {
    	let t_value = /*cell*/ ctx[26] + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*output*/ 1 && t_value !== (t_value = /*cell*/ ctx[26] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (216:6) {#each Object.values(row) as cell,i}
    function create_each_block_1$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_3(ctx, dirty) {
    		if (/*i*/ ctx[28] == 0) return create_if_block_1$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		i(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (214:12) {#each Object.values(output) as row ,  ii }
    function create_each_block$1(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = Object.values(/*row*/ ctx[23]);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	return {
    		c() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr(tr, "class", "border-b border-gray-200 ");
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append(tr, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*jockey, output, horse, show, selectedBookie, selectedOdds, selectedHorse, $oddsCal*/ 1853) {
    				each_value_1 = Object.values(/*row*/ ctx[23]);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		i(local) {
    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}
    		},
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*show*/ ctx[2] && create_if_block_6(ctx);
    	let if_block1 = /*output*/ ctx[0] && create_if_block$1(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*show*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*show*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*output*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*output*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(if_block1_anchor);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $calDate;
    	let $roptions;
    	let $oddsCal;
    	component_subscribe($$self, calDate, $$value => $$invalidate(6, $calDate = $$value));
    	component_subscribe($$self, roptions, $$value => $$invalidate(7, $roptions = $$value));
    	component_subscribe($$self, oddsCal, $$value => $$invalidate(8, $oddsCal = $$value));

    	onMount(() => {
    		getData();
    	});

    	let calendarDate = 0;

    	calDate.subscribe(value => {
    		$$invalidate(11, calendarDate = value);
    	});

    	let input;
    	let races;
    	let currRace;
    	inputs.subscribe(v => $$invalidate(12, input = v));
    	currentRace.subscribe(v => $$invalidate(14, currRace = v));
    	race.subscribe(v => $$invalidate(13, races = v));
    	let tableData;

    	var options = {
    		row: "horse_no",
    		column: "bookmaker",
    		value: "amount"
    	};

    	let output;
    	

    	function horse(hrs_no) {
    		let hrs = tableData.odds_compare[tableData.odds_compare.map(function (x) {
    			return x.horse_no;
    		}).indexOf(hrs_no)].horse;

    		return hrs;
    	}

    	function jockey(hrs_no) {
    		let jock = tableData.odds_compare[tableData.odds_compare.map(function (x) {
    			return x.horse_no;
    		}).indexOf(hrs_no)].jockey;

    		let wght = tableData.odds_compare[tableData.odds_compare.map(function (x) {
    			return x.horse_no;
    		}).indexOf(hrs_no)].weight;

    		return jock + " (" + wght + "kg)";
    	}

    	let bet;
    	let show = false;
    	let selectedHorse, selectedBookie, selectedOdds;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_1_input_handler() {
    		bet = to_number(this.value);
    		$$invalidate(1, bet);
    	}

    	const click_handler_1 = () => $$invalidate(2, show = false);
    	const click_handler_2 = () => $$invalidate(2, show = false);

    	function select_change_handler() {
    		$calDate = select_value(this);
    		calDate.set($calDate);
    	}

    	const click_handler_3 = (i, cell, ii) => {
    		$$invalidate(2, show = true);
    		$$invalidate(4, selectedBookie = Object.keys(output[0])[i]);
    		$$invalidate(5, selectedOdds = cell);
    		$$invalidate(3, selectedHorse = output[ii].horse_no + '. ' + horse(output[ii].horse_no));
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*calendarDate*/ 2048) {
    			if (calendarDate !== 0 && calendarDate !== undefined) {
    				getTData();
    			}
    		}

    		if ($$self.$$.dirty[0] & /*input, races, currRace*/ 28672) {
    			$$invalidate(15, tableData = input[races.indexOf(currRace)]);
    		}

    		if ($$self.$$.dirty[0] & /*tableData*/ 32768) {
    			if (tableData) {
    				$$invalidate(0, output = jsonToPivotJson(tableData.odds_compare, options));
    			}
    		}
    	};

    	return [
    		output,
    		bet,
    		show,
    		selectedHorse,
    		selectedBookie,
    		selectedOdds,
    		$calDate,
    		$roptions,
    		$oddsCal,
    		horse,
    		jockey,
    		calendarDate,
    		input,
    		races,
    		currRace,
    		tableData,
    		click_handler,
    		input_1_input_handler,
    		click_handler_1,
    		click_handler_2,
    		select_change_handler,
    		click_handler_3
    	];
    }

    class CompareOdds extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, {}, null, [-1, -1]);
    	}
    }

    /* src\App.svelte generated by Svelte v3.43.1 */

    function create_fragment$1(ctx) {
    	let style;
    	let t1;
    	let compareodds;
    	let current;
    	compareodds = new CompareOdds({});

    	return {
    		c() {
    			style = element("style");
    			style.textContent = "@-webkit-keyframes svelte-14ov47y-ticker{0%{-webkit-transform:translate3d(0, 0, 0);transform:translate3d(0, 0, 0);visibility:visible}100%{-webkit-transform:translate3d(-100%, 0, 0);transform:translate3d(-100%, 0, 0)}}@keyframes svelte-14ov47y-ticker{0%{-webkit-transform:translate3d(0, 0, 0);transform:translate3d(0, 0, 0);visibility:visible}100%{-webkit-transform:translate3d(-100%, 0, 0);transform:translate3d(-100%, 0, 0)}}.ticker-wrap.svelte-14ov47y.svelte-14ov47y{position:relative;bottom:0;width:100%;overflow:hidden;height:64px;box-sizing:content-box}.ticker-wrap.svelte-14ov47y .ticker.svelte-14ov47y{display:inline-block;height:10rem;line-height:4rem;white-space:nowrap;box-sizing:content-box;-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite;-webkit-animation-timing-function:linear;animation-timing-function:linear;-webkit-animation-name:svelte-14ov47y-ticker;animation-name:svelte-14ov47y-ticker;-webkit-animation-duration:var(--duration);animation-duration:var(--duration)}.ticker-wrap.svelte-14ov47y .ticker__item.svelte-14ov47y{display:inline-block;padding:0 2rem;font-size:16px}.ticker-wrap.svelte-14ov47y .ticker.svelte-14ov47y:hover{-webkit-animation-play-state:paused;-moz-animation-play-state:paused;-o-animation-play-state:paused;animation-play-state:paused}.down.svelte-14ov47y.svelte-14ov47y:before{display:inline-block;left:0;content:'▼';color:red;position:relative;scale:1.5}.down.svelte-14ov47y.svelte-14ov47y{background-color:rgba(255, 0, 0, 0.178);height:50px;width:110%;padding:1%;border:1px solid rgba(255, 0, 0, 0.767);border-radius:4px;color:rgb(141, 0, 0);font-weight:900}.up.svelte-14ov47y.svelte-14ov47y:before{display:inline-block;left:0;content:'▲';color:lime;position:relative;scale:1.5}.up.svelte-14ov47y.svelte-14ov47y{background-color:rgba(0, 255, 0, 0.108);height:50px;width:110%;padding:1%;border:1px solid  rgba(0, 255, 0, 0.767);height:50px;border-radius:4px;color:rgb(0, 141, 0);font-weight:900}.neutral.svelte-14ov47y.svelte-14ov47y{background-color:rgba(255, 191, 0, 0.108);height:50px;width:110%;padding:1%;padding-left:5%;border:1px solid  rgba(255, 191, 0, 0.767);border-radius:4px;color:rgb(141, 108, 0);font-weight:900}.caption.svelte-1l03gy.svelte-1l03gy{position:relative;height:50px}.tWrap.svelte-1l03gy.svelte-1l03gy{overflow-x:scroll}.oddstable.svelte-1l03gy.svelte-1l03gy{table-layout:fixed;min-width:1140px;max-width:1140px}.oddstable.svelte-1l03gy thead th.svelte-1l03gy{position:sticky;top:0;z-index:1;background:white}.oddstable.svelte-1l03gy td.svelte-1l03gy{max-width:20px !important;width:20px !important;cursor:pointer}.oddstable.svelte-1l03gy tbody th.svelte-1l03gy{position:relative}.oddstable.svelte-1l03gy thead th.svelte-1l03gy:first-child{position:sticky;left:0;z-index:2;-webkit-box-shadow:10px 0px 10px rgb(57 63 72), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;-moz-box-shadow:10px 0px 10px rgb(57 63 72), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;box-shadow:10px 0px 10px rgb(57 63 72), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;border-right:black solid 1px }.oddstable.svelte-1l03gy tbody th.svelte-1l03gy{position:sticky;left:0;background:white;z-index:1;max-width:100px;-webkit-box-shadow:10px 0px 10px rgb(57 63 72), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;-moz-box-shadow:10px 0px 10px rgb(57 63 72), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;box-shadow:10px 0px 10px rgb(57 63 72), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;border-right:black solid 1px }.oddscal.svelte-1l03gy.svelte-1l03gy{position:absolute;right:1%}.racebut.svelte-1l03gy.svelte-1l03gy{position:absolute;left:50%;transform:translate(-50%,0%)}.selectList.svelte-1l03gy.svelte-1l03gy{position:absolute;appearance:none;padding:10px;border:1px   solid rgba(65, 156, 44, 0.13);border-radius:0.25rem;left:1%}.overlay.svelte-1l03gy.svelte-1l03gy{z-index:101;position:fixed;top:0;right:0;bottom:0;left:0;width:100%;height:100%;background:rgba(0, 0, 0, 0.4)}.betCalc.svelte-1l03gy.svelte-1l03gy{position:absolute;left:50%;top:50%;background:white;width:350px;height:400px;border-radius:10px;transform:translate(-50%,-50%);display:flex;flex-direction:column;justify-content:center;align-items:center}.horse.svelte-1l03gy.svelte-1l03gy{display:flex;flex-direction:column}.horse.svelte-1l03gy span.svelte-1l03gy{align-self:flex-start}.betCalc.svelte-1l03gy svg.svelte-1l03gy{width:100px}.betCalc.svelte-1l03gy h3.svelte-1l03gy{font-weight:bolder}.bet.svelte-1l03gy.svelte-1l03gy{width:100px;height:40px;border-radius:5px}.rounded.svelte-1l03gy.svelte-1l03gy{background-color:#409C2C;box-shadow:0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);transition-timing-function:linear;transition-duration:150ms;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms;color:white;text-transform:uppercase;font-weight:700;font-size:16px;line-height:20px;padding-top:8px;padding-bottom:8px;padding-left:20px;padding-right:20px;border:none;border-radius:3px;margin-bottom:3px;cursor:pointer}.rounded.svelte-1l03gy.svelte-1l03gy:hover{background-color:rgb(255, 255, 255);color:rgb(104, 104, 104);background-image:linear-gradient(rgb(255, 255, 255) 95%, rgb(104, 104, 104) 20%)}.rounded-l.svelte-16yaimb{background-color:#409C2C;box-shadow:0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);transition-timing-function:linear;transition-duration:150ms;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms;color:white;text-transform:uppercase;font-weight:700;font-size:16px;line-height:20px;padding-top:12px;padding-bottom:12px;padding-left:24px;padding-right:24px;border:none;border-top-left-radius:4px;border-bottom-left-radius:4px;margin-bottom:4px;cursor:pointer}.rounded-r.svelte-16yaimb{background-color:#409C2C;box-shadow:0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);transition-timing-function:linear;transition-duration:150ms;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms;color:white;text-transform:uppercase;font-weight:700;font-size:16px;line-height:20px;padding-top:12px;padding-bottom:12px;padding-left:24px;padding-right:24px;border:none;border-top-right-radius:4px;border-bottom-right-radius:4px;margin-bottom:4px;cursor:pointer}.rounded.svelte-16yaimb{background-color:#409C2C;box-shadow:0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);transition-timing-function:linear;transition-duration:150ms;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms;color:white;text-transform:uppercase;font-weight:700;font-size:16px;line-height:20px;padding-top:12px;padding-bottom:12px;padding-left:24px;padding-right:24px;border:none;border-radius:4px;margin-bottom:4px;cursor:pointer}.roundeds.svelte-16yaimb{background-color:#409C2C;box-shadow:0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);transition-timing-function:linear;transition-duration:150ms;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms;color:white;text-transform:uppercase;font-weight:700;font-size:16px;line-height:20px;padding-top:12px;padding-bottom:12px;padding-left:24px;padding-right:24px;border:none;margin-bottom:4px;cursor:pointer}.rounded.svelte-16yaimb:hover,.rounded-l.svelte-16yaimb:hover,.rounded-r.svelte-16yaimb:hover,.roundeds.svelte-16yaimb:hover{background-color:rgb(255, 255, 255);color:rgb(104, 104, 104);background-image:linear-gradient(rgb(255, 255, 255) 95%, rgb(104, 104, 104) 20%)}.active.svelte-16yaimb{background-image:linear-gradient(#409C2C 95%, rgb(188, 247, 105) 20%);border-color:white !important}.active.svelte-12qrkab{background-image:linear-gradient(#409C2C 95%, rgb(188, 247, 105) 10%)}.rounded-r.svelte-12qrkab{background-color:#409C2C;box-shadow:0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);transition-timing-function:linear;transition-duration:150ms;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms;color:white;text-transform:uppercase;font-weight:700;font-size:16px;line-height:20px;padding-top:12px;padding-bottom:12px;padding-left:24px;padding-right:24px;border:none;border-top-right-radius:4px;border-bottom-right-radius:4px;margin-bottom:4px;cursor:pointer}.rounded-l.svelte-12qrkab{background-color:#409C2C;box-shadow:0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);transition-timing-function:linear;transition-duration:150ms;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms;color:white;text-transform:uppercase;font-weight:700;font-size:16px;line-height:20px;padding-top:12px;padding-bottom:12px;padding-left:24px;padding-right:24px;border:none;border-top-left-radius:4px;border-bottom-left-radius:4px;margin-bottom:4px;cursor:pointer}.rounded-l.svelte-12qrkab:hover,.rounded-r.svelte-12qrkab:hover{background-color:rgb(255, 255, 255);color:rgb(104, 104, 104);background-image:linear-gradient(rgb(255, 255, 255) 95%, rgb(104, 104, 104) 20%)}.overlay.svelte-4euwfi{z-index:101;position:fixed;top:0;right:0;bottom:0;left:0;width:100%;height:100%;background:rgba(0, 0, 0, 0.4)}.x.svelte-4euwfi{position:absolute;right:1%;font-weight:bolder;color:floralwhite;cursor:pointer;font-size:10px;text-shadow:-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black}.placeBet.svelte-4euwfi{background-color:#409C2C}.buttonBar.svelte-4euwfi{bottom:0;right:0;left:0}";
    			t1 = space();
    			create_component(compareodds.$$.fragment);
    		},
    		m(target, anchor) {
    			append(document.head, style);
    			insert(target, t1, anchor);
    			mount_component(compareodds, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(compareodds.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(compareodds.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			detach(style);
    			if (detaching) detach(t1);
    			destroy_component(compareodds, detaching);
    		}
    	};
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment$1, safe_not_equal, {});
    	}
    }

    /* src\components\marketMovers.svelte generated by Svelte v3.43.1 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (53:16) {#if  item.horse["odds_count"] >=1 }
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value_1 = Object.keys(/*item*/ ctx[8].horse);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*Object, a*/ 1) {
    				each_value_1 = Object.keys(/*item*/ ctx[8].horse);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (56:20) {#if horse != 'odds_count' }
    function create_if_block_1(ctx) {
    	let div;
    	let strong;
    	let t0_value = /*item*/ ctx[8].bookie + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = /*horse*/ ctx[11] + "";
    	let t3;
    	let t4;
    	let show_if;
    	let show_if_1;
    	let t5;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*a*/ 1) show_if = !!(Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-1) > Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-2));
    		if (show_if) return create_if_block_2;
    		if (show_if_1 == null || dirty & /*a*/ 1) show_if_1 = !!(Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-1) < Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-2));
    		if (show_if_1) return create_if_block_3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			div = element("div");
    			strong = element("strong");
    			t0 = text(t0_value);
    			t1 = text(" :");
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			if_block.c();
    			t5 = space();
    			attr(div, "class", "ticker__item svelte-1eipdh0");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, strong);
    			append(strong, t0);
    			append(strong, t1);
    			append(div, t2);
    			append(div, t3);
    			append(div, t4);
    			if_block.m(div, null);
    			append(div, t5);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*a*/ 1 && t0_value !== (t0_value = /*item*/ ctx[8].bookie + "")) set_data(t0, t0_value);
    			if (dirty & /*a*/ 1 && t3_value !== (t3_value = /*horse*/ ctx[11] + "")) set_data(t3, t3_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t5);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if_block.d();
    		}
    	};
    }

    // (65:26) {:else}
    function create_else_block(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			span.textContent = "0.00%";
    			attr(span, "class", "neutral svelte-1eipdh0");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (62:122) 
    function create_if_block_3(ctx) {
    	let span;
    	let t0;
    	let t1_value = ((Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-2) - Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-1)) / Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-2) * 100).toFixed(2) + "";
    	let t1;
    	let t2;

    	return {
    		c() {
    			span = element("span");
    			t0 = text("- ");
    			t1 = text(t1_value);
    			t2 = text("%");
    			attr(span, "class", "down svelte-1eipdh0");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t0);
    			append(span, t1);
    			append(span, t2);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*a*/ 1 && t1_value !== (t1_value = ((Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-2) - Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-1)) / Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-2) * 100).toFixed(2) + "")) set_data(t1, t1_value);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (58:20) {#if (Object.values(item.horse[horse]).at(-1)) > (Object.values(item.horse[horse]).at(-2)) }
    function create_if_block_2(ctx) {
    	let span;
    	let t0;
    	let t1_value = ((Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-1) - Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-2)) / Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-2) * 100).toFixed(2) + "";
    	let t1;
    	let t2;

    	return {
    		c() {
    			span = element("span");
    			t0 = text("+ ");
    			t1 = text(t1_value);
    			t2 = text("%");
    			attr(span, "class", "up svelte-1eipdh0");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t0);
    			append(span, t1);
    			append(span, t2);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*a*/ 1 && t1_value !== (t1_value = ((Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-1) - Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-2)) / Object.values(/*item*/ ctx[8].horse[/*horse*/ ctx[11]]).at(-2) * 100).toFixed(2) + "")) set_data(t1, t1_value);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (55:20) {#each Object.keys(item.horse) as horse , i}
    function create_each_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = /*horse*/ ctx[11] != 'odds_count' && create_if_block_1(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (/*horse*/ ctx[11] != 'odds_count') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (52:16) {#each a as item, bk}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*item*/ ctx[8].horse["odds_count"] >= 1 && create_if_block(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (/*item*/ ctx[8].horse["odds_count"] >= 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let div0_style_value;
    	let each_value = /*a*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div0, "class", "ticker svelte-1eipdh0");
    			attr(div0, "style", div0_style_value = "--duration :" + /*duration*/ ctx[1]);
    			attr(div1, "class", "ticker-wrap svelte-1eipdh0");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*Object, a*/ 1) {
    				each_value = /*a*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*duration*/ 2 && div0_style_value !== (div0_style_value = "--duration :" + /*duration*/ ctx[1])) {
    				attr(div0, "style", div0_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let oddsData;
    	let o;
    	let a;
    	let oddsCounts;
    	let duration;
    	let $currentRace;
    	let $race;
    	let $inputs;
    	component_subscribe($$self, currentRace, $$value => $$invalidate(5, $currentRace = $$value));
    	component_subscribe($$self, race, $$value => $$invalidate(6, $race = $$value));
    	component_subscribe($$self, inputs, $$value => $$invalidate(7, $inputs = $$value));

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$inputs*/ 128) {
    			console.log($inputs);
    		}

    		if ($$self.$$.dirty & /*$inputs, $race, $currentRace*/ 224) {
    			$$invalidate(3, oddsData = $inputs[$race.indexOf($currentRace)].odds_compare.map((item, i) => {
    				let container = {};
    				container.bookie = item.bookmaker;
    				container.horse = item.horse;

    				container.odds = item.odds_obj == null
    				? {}
    				: JSON.parse(item.odds_obj.replace(String.fromCharCode(92), null).replace(/[{}]/g, '').replace(/\[/g, '{').replace(/]/g, '}'));

    				container.odds_count = item.odds_count == null ? 0 : item.odds_count;
    				container.newodds = item.odds;
    				return container;
    			}));
    		}

    		if ($$self.$$.dirty & /*oddsData*/ 8) {
    			$$invalidate(4, o = oddsData.reduce(
    				(a, b) => {
    					a[b.bookie] = a[b.bookie] || [];

    					a[b.bookie].push({
    						[b.horse]: b.odds,
    						'odds_count': b.odds_count
    					});

    					return a;
    				},
    				{}
    			));
    		}

    		if ($$self.$$.dirty & /*o*/ 16) {
    			$$invalidate(0, a = Object.keys(o).map(function (k) {
    				return {
    					bookie: k,
    					horse: Object.assign.apply({}, o[k])
    				};
    			}));
    		}

    		if ($$self.$$.dirty & /*a*/ 1) {
    			console.log(a);
    		}

    		if ($$self.$$.dirty & /*oddsData*/ 8) {
    			$$invalidate(2, oddsCounts = oddsData.map(item => {
    				return item.odds_count;
    			}).reduce((a, b) => a + b));
    		}

    		if ($$self.$$.dirty & /*oddsCounts*/ 4) {
    			$$invalidate(1, duration = 1 * oddsCounts + 's');
    		}
    	};

    	return [a, duration, oddsCounts, oddsData, o, $currentRace, $race, $inputs];
    }

    class MarketMovers extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, {});
    	}
    }

    const app = new App({
        target: document.querySelector('#odds-compare')
    });

    const mv = new MarketMovers({
        target: document.querySelector('#market-movers')
    });

    exports.app = app;
    exports.mv = mv;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=bundle.js.map

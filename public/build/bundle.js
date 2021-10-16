
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
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
    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src\components\buttonGroup.svelte generated by Svelte v3.43.1 */
    const file$4 = "src\\components\\buttonGroup.svelte";

    function get_each_context$3(ctx, list, i) {
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

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();

    			attr_dev(button, "class", button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " numB text-white hover:bg-green-300 active:bg-green-300 hover:text-green-900 focus:text-green-900 focus:bg-green-300 font-bold uppercase text-xs px-6 py-3 outline-none focus:outline-none mb-1 ease-linear transition-all duration-150" + " svelte-1ishgnu"));

    			attr_dev(button, "type", "button");
    			add_location(button, file$4, 43, 4, 1477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*setRace*/ ctx[2](/*item*/ ctx[3]))) /*setRace*/ ctx[2](/*item*/ ctx[3]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$race*/ 1 && t0_value !== (t0_value = /*item*/ ctx[3] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$currentRace, $race*/ 3 && button_class_value !== (button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " numB text-white hover:bg-green-300 active:bg-green-300 hover:text-green-900 focus:text-green-900 focus:bg-green-300 font-bold uppercase text-xs px-6 py-3 outline-none focus:outline-none mb-1 ease-linear transition-all duration-150" + " svelte-1ishgnu"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(42:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:30) 
    function create_if_block_2$1(ctx) {
    	let button;
    	let t0_value = /*item*/ ctx[3] + "";
    	let t0;
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();

    			attr_dev(button, "class", button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase text-xs px-6 py-3 outline-none focus:outline-none mb-1 ease-linear rounded-l transition-all duration-150" + " svelte-1ishgnu"));

    			attr_dev(button, "type", "button");
    			add_location(button, file$4, 33, 4, 1095);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*setRace*/ ctx[2](/*item*/ ctx[3]))) /*setRace*/ ctx[2](/*item*/ ctx[3]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$race*/ 1 && t0_value !== (t0_value = /*item*/ ctx[3] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$currentRace, $race*/ 3 && button_class_value !== (button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase text-xs px-6 py-3 outline-none focus:outline-none mb-1 ease-linear rounded-l transition-all duration-150" + " svelte-1ishgnu"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(32:30) ",
    		ctx
    	});

    	return block;
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

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();

    			attr_dev(button, "class", button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase text-xs px-6 py-3 outline-none focus:outline-none mb-1 ease-linear rounded-r transition-all duration-150" + " svelte-1ishgnu"));

    			attr_dev(button, "type", "button");
    			add_location(button, file$4, 23, 4, 690);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*setRace*/ ctx[2](/*item*/ ctx[3]))) /*setRace*/ ctx[2](/*item*/ ctx[3]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$race*/ 1 && t0_value !== (t0_value = /*item*/ ctx[3] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$currentRace, $race*/ 3 && button_class_value !== (button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase text-xs px-6 py-3 outline-none focus:outline-none mb-1 ease-linear rounded-r transition-all duration-150" + " svelte-1ishgnu"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(21:36) ",
    		ctx
    	});

    	return block;
    }

    // (12:4) {#if $race.length == 1 }
    function create_if_block$3(ctx) {
    	let button;
    	let t0_value = /*item*/ ctx[3] + "";
    	let t0;
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();

    			attr_dev(button, "class", button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase text-xs px-6 py-3 outline-none focus:outline-none mb-1 ease-linear rounded transition-all duration-150" + " svelte-1ishgnu"));

    			attr_dev(button, "type", "button");
    			add_location(button, file$4, 13, 4, 278);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*setRace*/ ctx[2](/*item*/ ctx[3]))) /*setRace*/ ctx[2](/*item*/ ctx[3]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$race*/ 1 && t0_value !== (t0_value = /*item*/ ctx[3] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$currentRace, $race*/ 3 && button_class_value !== (button_class_value = "" + ((/*$currentRace*/ ctx[1] == /*item*/ ctx[3]
    			? 'active'
    			: '') + " numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase text-xs px-6 py-3 outline-none focus:outline-none mb-1 ease-linear rounded transition-all duration-150" + " svelte-1ishgnu"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(12:4) {#if $race.length == 1 }",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#each $race as item}
    function create_each_block$3(ctx) {
    	let show_if;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*$race*/ ctx[0].length == 1) return create_if_block$3;
    		if (show_if == null || dirty & /*$race*/ 1) show_if = !!(/*$race*/ ctx[0].at(-1) == /*item*/ ctx[3]);
    		if (show_if) return create_if_block_1$2;
    		if (/*$race*/ ctx[0][0] == /*item*/ ctx[3]) return create_if_block_2$1;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
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
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(11:4) {#each $race as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let each_value = /*$race*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "bGroup flex relative items-center justify-center mb-4");
    			add_location(div, file$4, 8, 0, 140);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$currentRace, $race, setRace*/ 7) {
    				each_value = /*$race*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $race;
    	let $currentRace;
    	validate_store(race, 'race');
    	component_subscribe($$self, race, $$value => $$invalidate(0, $race = $$value));
    	validate_store(currentRace, 'currentRace');
    	component_subscribe($$self, currentRace, $$value => $$invalidate(1, $currentRace = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ButtonGroup', slots, []);

    	function setRace(raceNo) {
    		currentRace.set(raceNo);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ButtonGroup> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		race,
    		currentRace,
    		setRace,
    		$race,
    		$currentRace
    	});

    	return [$race, $currentRace, setRace];
    }

    class ButtonGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonGroup",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\oddsCal.svelte generated by Svelte v3.43.1 */
    const file$3 = "src\\components\\oddsCal.svelte";

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

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			t0 = text("f100");
    			t1 = space();
    			button1 = element("button");
    			t2 = text("f500");
    			attr_dev(button0, "class", button0_class_value = "" + ((/*$oddsCal*/ ctx[0] == false ? 'active' : '') + " numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase text-xs px-4 py-2 outline-none focus:outline-none mb-1 ease-linear rounded-l transition-all duration-150" + " svelte-1ishgnu"));
    			attr_dev(button0, "type", "button");
    			add_location(button0, file$3, 7, 4, 146);
    			attr_dev(button1, "class", button1_class_value = "" + ((/*$oddsCal*/ ctx[0] == true ? 'active' : '') + " numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase text-xs px-4 py-2 outline-none focus:outline-none mb-1 ease-linear rounded-r transition-all duration-150" + " svelte-1ishgnu"));
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$3, 14, 4, 516);
    			attr_dev(div, "class", "bGroup2 flex relative items-center justify-center mb-4");
    			add_location(div, file$3, 5, 0, 70);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, t0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(button1, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$oddsCal*/ 1 && button0_class_value !== (button0_class_value = "" + ((/*$oddsCal*/ ctx[0] == false ? 'active' : '') + " numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase text-xs px-4 py-2 outline-none focus:outline-none mb-1 ease-linear rounded-l transition-all duration-150" + " svelte-1ishgnu"))) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (dirty & /*$oddsCal*/ 1 && button1_class_value !== (button1_class_value = "" + ((/*$oddsCal*/ ctx[0] == true ? 'active' : '') + " numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase text-xs px-4 py-2 outline-none focus:outline-none mb-1 ease-linear rounded-r transition-all duration-150" + " svelte-1ishgnu"))) {
    				attr_dev(button1, "class", button1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $oddsCal;
    	validate_store(oddsCal, 'oddsCal');
    	component_subscribe($$self, oddsCal, $$value => $$invalidate(0, $oddsCal = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OddsCal', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<OddsCal> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => oddsCal.set(false);
    	const click_handler_1 = () => oddsCal.set(true);
    	$$self.$capture_state = () => ({ oddsCal, $oddsCal });
    	return [$oddsCal, click_handler, click_handler_1];
    }

    class OddsCal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OddsCal",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\table.svelte generated by Svelte v3.43.1 */

    const { Object: Object_1, console: console_1$1 } = globals;
    const file$2 = "src\\components\\table.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (58:12) {:else}
    function create_else_block_3(ctx) {
    	let th;
    	let t_value = /*columnHeading*/ ctx[14] + "";
    	let t;
    	let th_intro;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			attr_dev(th, "class", "py-3 px-6 text-center");
    			add_location(th, file$2, 59, 12, 2039);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*output*/ 4 && t_value !== (t_value = /*columnHeading*/ ctx[14] + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!th_intro) {
    				add_render_callback(() => {
    					th_intro = create_in_transition(th, blur, {});
    					th_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(58:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:12) {#if i == 0}
    function create_if_block_3(ctx) {
    	let th;
    	let th_intro;

    	const block = {
    		c: function create() {
    			th = element("th");
    			th.textContent = "Horse";
    			attr_dev(th, "class", "py-3 px-6 text-center");
    			add_location(th, file$2, 56, 12, 1949);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!th_intro) {
    				add_render_callback(() => {
    					th_intro = create_in_transition(th, blur, {});
    					th_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(56:12) {#if i == 0}",
    		ctx
    	});

    	return block;
    }

    // (54:3) {#each Object.keys(output[0]) as columnHeading , i}
    function create_each_block_2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*i*/ ctx[13] == 0) return create_if_block_3;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(54:3) {#each Object.keys(output[0]) as columnHeading , i}",
    		ctx
    	});

    	return block;
    }

    // (92:16) {:else}
    function create_else_block$1(ctx) {
    	let td;
    	let div;
    	let span;
    	let span_intro;

    	function select_block_type_2(ctx, dirty) {
    		if (/*$oddsCal*/ ctx[3] == true) return create_if_block_1$1;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			td = element("td");
    			div = element("div");
    			span = element("span");
    			if_block.c();
    			attr_dev(span, "class", "font-medium ");
    			add_location(span, file$2, 94, 24, 5330);
    			attr_dev(div, "class", "block items-center");
    			add_location(div, file$2, 93, 20, 5272);
    			attr_dev(td, "class", "py-3 px-6 text-right whitespace-nowrap ");
    			add_location(td, file$2, 92, 16, 5198);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, div);
    			append_dev(div, span);
    			if_block.m(span, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
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
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, blur, {});
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(92:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (72:16) {#if i == 0}
    function create_if_block$2(ctx) {
    	let th;
    	let div2;
    	let div0;
    	let svg;
    	let metadata;
    	let g;
    	let path;
    	let div0_intro;
    	let t0;
    	let div1;
    	let span0;
    	let t1_value = /*cell*/ ctx[11] + "";
    	let t1;
    	let t2;
    	let t3_value = /*horse*/ ctx[4](/*cell*/ ctx[11]) + "";
    	let t3;
    	let span0_intro;
    	let t4;
    	let span1;
    	let t5_value = /*jockey*/ ctx[5](/*cell*/ ctx[11]) + "";
    	let t5;
    	let span1_intro;

    	const block = {
    		c: function create() {
    			th = element("th");
    			div2 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			metadata = svg_element("metadata");
    			g = svg_element("g");
    			path = svg_element("path");
    			t0 = space();
    			div1 = element("div");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = text(". ");
    			t3 = text(t3_value);
    			t4 = space();
    			span1 = element("span");
    			t5 = text(t5_value);
    			add_location(metadata, file$2, 76, 32, 2864);
    			attr_dev(path, "d", "M2955 3536 c-37 -17 -70 -52 -84 -89 -7 -18 -11 -138 -11 -323 l0 -294 573 0 c621 0 625 -1 728 -56 114 -62 217 -203 254 -349 19 -77 19 -194 -1 -264 -18 -64 -43 -104 -51 -82 -17 44 -94 119 -157 151 l-69 35 -426 5 c-413 5 -428 6 -491 28 -182 65 -286 187 -345 407 -13 48 -14 43 -14 -110 l-1 -159 215 -216 214 -215 8 35 9 35 253 3 c209 2 252 0 248 -11 -3 -7 -28 -96 -57 -198 -28 -101 -58 -206 -65 -232 -8 -26 -11 -45 -6 -43 4 3 41 -28 81 -69 l74 -74 -105 -4 c-57 -1 14 -4 159 -5 291 -2 359 6 445 56 55 32 138 110 168 158 12 20 32 37 47 40 101 23 226 56 276 74 90 31 89 32 81 -52 -16 -175 -72 -353 -145 -465 -22 -34 -77 -96 -122 -138 -63 -60 -102 -87 -182 -125 -55 -27 -123 -54 -149 -61 -26 -6 -46 -14 -43 -16 2 -2 23 1 46 7 31 8 45 8 55 0 10 -8 22 -7 47 6 18 9 42 18 53 20 19 2 1353 742 1384 767 24 20 51 90 51 135 0 51 -19 99 -52 129 -21 20 -752 433 -765 433 -3 0 -40 -32 -82 -72 -145 -135 -333 -271 -539 -388 -97 -55 -129 -61 -71 -13 47 39 216 190 327 292 52 47 127 124 168 170 l74 84 -193 106 c-105 59 -489 273 -852 476 -363 203 -704 393 -757 423 -105 58 -156 70 -203 48z m1675 -956 c80 -80 160 -195 160 -230 0 -22 -125 -144 -139 -136 -6 4 -11 24 -11 45 0 102 -71 286 -155 399 -25 34 -45 64 -45 67 0 17 119 -73 190 -145z m495 -346 l7 -60 -125 -82 c-254 -167 -528 -277 -784 -317 -66 -10 -52 9 30 40 139 54 402 190 534 277 79 53 170 124 225 177 l93 89 7 -31 c4 -18 10 -59 13 -93z m-100 -276 c22 -86 27 -80 -123 -138 -204 -79 -458 -128 -770 -150 -189 -12 -352 -13 -352 -1 0 5 35 12 78 16 127 11 350 44 463 70 220 49 481 152 634 249 22 14 43 26 46 26 4 0 15 -32 24 -72z");
    			add_location(path, file$2, 79, 32, 3088);
    			attr_dev(g, "transform", "translate(0.000000,382.000000) scale(0.100000,-0.100000)");
    			attr_dev(g, "stroke", "none");
    			attr_dev(g, "fill", "#409C2C");
    			add_location(g, file$2, 78, 32, 2953);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "version", "1.0");
    			attr_dev(svg, "width", "600.000000pt");
    			attr_dev(svg, "height", "382.000000pt");
    			attr_dev(svg, "viewBox", "0 0 600.000000 382.000000");
    			attr_dev(svg, "preserveAspectRatio", "xMidYMid meet");
    			attr_dev(svg, "class", "logo svelte-1fea0lf");
    			add_location(svg, file$2, 75, 28, 2648);
    			attr_dev(div0, "class", "mr-2");
    			add_location(div0, file$2, 74, 24, 2592);
    			attr_dev(span0, "class", "font-medium");
    			add_location(span0, file$2, 85, 28, 4885);
    			attr_dev(span1, "class", "font-black text-xs mx-4");
    			add_location(span1, file$2, 86, 28, 4979);
    			attr_dev(div1, "class", "flex flex-col");
    			add_location(div1, file$2, 83, 24, 4799);
    			attr_dev(div2, "class", "flex items-center");
    			add_location(div2, file$2, 73, 20, 2535);
    			attr_dev(th, "class", "relative py-3 px-6 text-left whitespace-nowrap drop-shadow-lg");
    			add_location(th, file$2, 72, 16, 2438);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, div2);
    			append_dev(div2, div0);
    			append_dev(div0, svg);
    			append_dev(svg, metadata);
    			append_dev(svg, g);
    			append_dev(g, path);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(span0, t1);
    			append_dev(span0, t2);
    			append_dev(span0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, span1);
    			append_dev(span1, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*output*/ 4 && t1_value !== (t1_value = /*cell*/ ctx[11] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*output*/ 4 && t3_value !== (t3_value = /*horse*/ ctx[4](/*cell*/ ctx[11]) + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*output*/ 4 && t5_value !== (t5_value = /*jockey*/ ctx[5](/*cell*/ ctx[11]) + "")) set_data_dev(t5, t5_value);
    		},
    		i: function intro(local) {
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(72:16) {#if i == 0}",
    		ctx
    	});

    	return block;
    }

    // (104:28) {:else}
    function create_else_block_2(ctx) {
    	let t_value = /*cell*/ ctx[11] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*output*/ 4 && t_value !== (t_value = /*cell*/ ctx[11] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(104:28) {:else}",
    		ctx
    	});

    	return block;
    }

    // (96:28) {#if $oddsCal == true}
    function create_if_block_1$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_3(ctx, dirty) {
    		if (/*cell*/ ctx[11] == 0) return create_if_block_2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block) {
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
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(96:28) {#if $oddsCal == true}",
    		ctx
    	});

    	return block;
    }

    // (100:28) {:else}
    function create_else_block_1(ctx) {
    	let t_value = (100 / (/*cell*/ ctx[11] / 500)).toFixed(2) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*output*/ 4 && t_value !== (t_value = (100 / (/*cell*/ ctx[11] / 500)).toFixed(2) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(100:28) {:else}",
    		ctx
    	});

    	return block;
    }

    // (98:28) {#if cell == 0 }
    function create_if_block_2(ctx) {
    	let t_value = /*cell*/ ctx[11] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*output*/ 4 && t_value !== (t_value = /*cell*/ ctx[11] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(98:28) {#if cell == 0 }",
    		ctx
    	});

    	return block;
    }

    // (70:4) {#each Object.values(row) as cell,i}
    function create_each_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*i*/ ctx[13] == 0) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(70:4) {#each Object.values(row) as cell,i}",
    		ctx
    	});

    	return block;
    }

    // (66:2) {#each Object.values(output) as row}
    function create_each_block$2(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = Object.values(/*row*/ ctx[8]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(tr, "class", "border-b border-gray-200 hover:bg-gray-100");
    			add_location(tr, file$2, 67, 8, 2262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*jockey, Object, output, horse, $oddsCal*/ 60) {
    				each_value_1 = Object.values(/*row*/ ctx[8]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
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
    		i: function intro(local) {
    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(66:2) {#each Object.values(output) as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let div1;
    	let buttongroup;
    	let t0;
    	let oddscal;
    	let t1;
    	let div0;
    	let table;
    	let caption;
    	let span0;
    	let t2;
    	let t3;
    	let span0_intro;
    	let t4;
    	let span1;
    	let t5;
    	let span1_intro;
    	let t6;
    	let thead;
    	let tr0;
    	let t7;
    	let tr1;
    	let t8;
    	let tbody;
    	let current;
    	buttongroup = new ButtonGroup({ $$inline: true });
    	oddscal = new OddsCal({ $$inline: true });
    	let each_value_2 = Object.keys(/*output*/ ctx[2][0]);
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = Object.values(/*output*/ ctx[2]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			create_component(buttongroup.$$.fragment);
    			t0 = space();
    			create_component(oddscal.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			table = element("table");
    			caption = element("caption");
    			span0 = element("span");
    			t2 = text("Race: ");
    			t3 = text(/*raceNum*/ ctx[0]);
    			t4 = text("   ");
    			span1 = element("span");
    			t5 = text(/*startTime*/ ctx[1]);
    			t6 = space();
    			thead = element("thead");
    			tr0 = element("tr");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();
    			tr1 = element("tr");
    			t8 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span0, "class", "capleft svelte-1fea0lf");
    			add_location(span0, file$2, 49, 78, 1624);
    			attr_dev(span1, "class", "caprght svelte-1fea0lf");
    			add_location(span1, file$2, 49, 140, 1686);
    			attr_dev(caption, "class", "relative bg-gray-200 text-gray-600 head svelte-1fea0lf");
    			add_location(caption, file$2, 49, 20, 1566);
    			attr_dev(tr0, "class", "bg-gray-200 text-gray-600 uppercase text-sm leading-normal");
    			add_location(tr0, file$2, 52, 8, 1768);
    			add_location(tr1, file$2, 62, 2, 2137);
    			add_location(thead, file$2, 50, 1, 1747);
    			attr_dev(tbody, "class", "text-gray-600 text-sm font-light");
    			add_location(tbody, file$2, 64, 4, 2159);
    			attr_dev(table, "class", "min-w-max w-full table-auto svelte-1fea0lf");
    			add_location(table, file$2, 48, 16, 1499);
    			attr_dev(div0, "class", "bg-white shadow-lg rounded my-6");
    			add_location(div0, file$2, 47, 12, 1436);
    			attr_dev(div1, "class", "relative w-full lg:w-5/6");
    			add_location(div1, file$2, 43, 8, 1234);
    			attr_dev(div2, "class", "min-w-screen min-h-screen bg-gray-100 flex items-start justify-center bg-gray-100 font-sans overflow-hidden");
    			add_location(div2, file$2, 41, 4, 1093);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			mount_component(buttongroup, div1, null);
    			append_dev(div1, t0);
    			mount_component(oddscal, div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, table);
    			append_dev(table, caption);
    			append_dev(caption, span0);
    			append_dev(span0, t2);
    			append_dev(span0, t3);
    			append_dev(caption, t4);
    			append_dev(caption, span1);
    			append_dev(span1, t5);
    			append_dev(table, t6);
    			append_dev(table, thead);
    			append_dev(thead, tr0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr0, null);
    			}

    			append_dev(tr0, t7);
    			append_dev(thead, tr1);
    			append_dev(table, t8);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*raceNum*/ 1) set_data_dev(t3, /*raceNum*/ ctx[0]);
    			if (!current || dirty & /*startTime*/ 2) set_data_dev(t5, /*startTime*/ ctx[1]);

    			if (dirty & /*Object, output*/ 4) {
    				each_value_2 = Object.keys(/*output*/ ctx[2][0]);
    				validate_each_argument(each_value_2);
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
    						each_blocks_1[i].m(tr0, t7);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*Object, output, jockey, horse, $oddsCal*/ 60) {
    				each_value = Object.values(/*output*/ ctx[2]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttongroup.$$.fragment, local);
    			transition_in(oddscal.$$.fragment, local);

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

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttongroup.$$.fragment, local);
    			transition_out(oddscal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(buttongroup);
    			destroy_component(oddscal);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let output;
    	let $oddsCal;
    	validate_store(oddsCal, 'oddsCal');
    	component_subscribe($$self, oddsCal, $$value => $$invalidate(3, $oddsCal = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Table', slots, []);
    	let { tableData = [] } = $$props;
    	let { raceNum } = $$props;
    	let { startTime } = $$props;

    	// export let raceName ;
    	var options = {
    		row: "horse_no",
    		column: "bookmaker",
    		value: "amount"
    	};

    	console.log(tableData);

    	function horse(hrs_no) {
    		let hrs = tableData[tableData.map(function (x) {
    			return x.horse_no;
    		}).indexOf(hrs_no)].horse;

    		return hrs;
    	}

    	function jockey(hrs_no) {
    		let jock = tableData[tableData.map(function (x) {
    			return x.horse_no;
    		}).indexOf(hrs_no)].jockey;

    		let wght = tableData[tableData.map(function (x) {
    			return x.horse_no;
    		}).indexOf(hrs_no)].weight;

    		return jock + " (" + wght + "kg)";
    	}

    	const writable_props = ['tableData', 'raceNum', 'startTime'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Table> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('tableData' in $$props) $$invalidate(6, tableData = $$props.tableData);
    		if ('raceNum' in $$props) $$invalidate(0, raceNum = $$props.raceNum);
    		if ('startTime' in $$props) $$invalidate(1, startTime = $$props.startTime);
    	};

    	$$self.$capture_state = () => ({
    		jsonToPivotjson: jsonToPivotJson,
    		race,
    		currentRace,
    		oddsCal,
    		fade,
    		blur,
    		slide,
    		ButtonGroup,
    		OddsCal,
    		tableData,
    		raceNum,
    		startTime,
    		options,
    		horse,
    		jockey,
    		output,
    		$oddsCal
    	});

    	$$self.$inject_state = $$props => {
    		if ('tableData' in $$props) $$invalidate(6, tableData = $$props.tableData);
    		if ('raceNum' in $$props) $$invalidate(0, raceNum = $$props.raceNum);
    		if ('startTime' in $$props) $$invalidate(1, startTime = $$props.startTime);
    		if ('options' in $$props) $$invalidate(7, options = $$props.options);
    		if ('output' in $$props) $$invalidate(2, output = $$props.output);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*tableData*/ 64) {
    			$$invalidate(2, output = jsonToPivotJson(tableData, options));
    		}
    	};

    	return [raceNum, startTime, output, $oddsCal, horse, jockey, tableData];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { tableData: 6, raceNum: 0, startTime: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*raceNum*/ ctx[0] === undefined && !('raceNum' in props)) {
    			console_1$1.warn("<Table> was created without expected prop 'raceNum'");
    		}

    		if (/*startTime*/ ctx[1] === undefined && !('startTime' in props)) {
    			console_1$1.warn("<Table> was created without expected prop 'startTime'");
    		}
    	}

    	get tableData() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tableData(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get raceNum() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set raceNum(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get startTime() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set startTime(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\dropdown.svelte generated by Svelte v3.43.1 */
    const file$1 = "src\\components\\dropdown.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (31:3) {:else}
    function create_else_block(ctx) {
    	let option;

    	const block = {
    		c: function create() {
    			option = element("option");
    			option.textContent = "No Meetings";
    			option.__value = "";
    			option.value = option.__value;
    			add_location(option, file$1, 32, 3, 902);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(31:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (27:4) {#if rd_options}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*rd_options*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rd_options*/ 2) {
    				each_value = /*rd_options*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(27:4) {#if rd_options}",
    		ctx
    	});

    	return block;
    }

    // (28:3) {#each rd_options as opt}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*opt*/ ctx[5].race_date + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*opt*/ ctx[5].r;
    			option.value = option.__value;
    			add_location(option, file$1, 28, 3, 821);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rd_options*/ 2 && t_value !== (t_value = /*opt*/ ctx[5].race_date + "")) set_data_dev(t, t_value);

    			if (dirty & /*rd_options*/ 2 && option_value_value !== (option_value_value = /*opt*/ ctx[5].r)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(28:3) {#each rd_options as opt}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let select;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*rd_options*/ ctx[1]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");
    			if_block.c();
    			attr_dev(select, "class", "relative block appearance-none bg-green-100 border border-green-500 hover:border-green-700 px-4 py-3 pr-4 rounded shadow leading-tight focus:outline-none focus:shadow-outline");
    			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$1, 25, 0, 505);
    			attr_dev(div, "id", "ddown");
    			attr_dev(div, "class", "absolute bGroup3");
    			add_location(div, file$1, 24, 0, 462);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);
    			if_block.m(select, null);
    			select_option(select, /*selected*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[2]),
    					listen_dev(select, "change", /*change_handler*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(select, null);
    				}
    			}

    			if (dirty & /*selected, rd_options*/ 3) {
    				select_option(select, /*selected*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dropdown', slots, []);
    	let rd_options;
    	let selected;

    	const getData = async () => {
    		const response = await fetch('https://utxnaxbctngt41y-gra.adb.uk-london-1.oraclecloudapps.com/ords/gra/races/rd', { headers: { 'APP_USER': 'AJAY' } });
    		let tData = await response.json();
    		$$invalidate(1, rd_options = tData.items);
    		$$invalidate(0, selected = rd_options[0].r);
    	};

    	getData();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dropdown> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(0, selected);
    		$$invalidate(1, rd_options);
    	}

    	const change_handler = () => calDate.set(selected);
    	$$self.$capture_state = () => ({ calDate, rd_options, selected, getData });

    	$$self.$inject_state = $$props => {
    		if ('rd_options' in $$props) $$invalidate(1, rd_options = $$props.rd_options);
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selected*/ 1) {
    			calDate.set(selected);
    		}
    	};

    	return [selected, rd_options, select_change_handler, change_handler];
    }

    class Dropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dropdown",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.43.1 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (43:0) {#if input}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*input*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*input, $race, $currentRace*/ 7) {
    				each_value = /*input*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(43:0) {#if input}",
    		ctx
    	});

    	return block;
    }

    // (47:6) {#if item.race_no == $race[ $race.indexOf($currentRace)]}
    function create_if_block_1(ctx) {
    	let table;
    	let current;

    	table = new Table({
    			props: {
    				tableData: /*item*/ ctx[7].odds_compare,
    				raceNum: /*item*/ ctx[7].race_no,
    				startTime: /*item*/ ctx[7].start_time
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};
    			if (dirty & /*input*/ 1) table_changes.tableData = /*item*/ ctx[7].odds_compare;
    			if (dirty & /*input*/ 1) table_changes.raceNum = /*item*/ ctx[7].race_no;
    			if (dirty & /*input*/ 1) table_changes.startTime = /*item*/ ctx[7].start_time;
    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(47:6) {#if item.race_no == $race[ $race.indexOf($currentRace)]}",
    		ctx
    	});

    	return block;
    }

    // (45:2) {#each input as item}
    function create_each_block(ctx) {
    	let show_if = /*item*/ ctx[7].race_no == /*$race*/ ctx[1][/*$race*/ ctx[1].indexOf(/*$currentRace*/ ctx[2])];
    	let t;
    	let current;
    	let if_block = show_if && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*input, $race, $currentRace*/ 7) show_if = /*item*/ ctx[7].race_no == /*$race*/ ctx[1][/*$race*/ ctx[1].indexOf(/*$currentRace*/ ctx[2])];

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*input, $race, $currentRace*/ 7) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(45:2) {#each input as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link;
    	let style;
    	let t1;
    	let dropdown;
    	let t2;
    	let if_block_anchor;
    	let current;
    	dropdown = new Dropdown({ $$inline: true });
    	let if_block = /*input*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			style = element("style");
    			style.textContent = ".bGroup{top:0%;left:50%;transform:translate(-50%,140%);z-index:1}.bGroup2{top:50%;left:89%;transform:translate(0%,20%);z-index:1;max-width:200px}.bGroup3{top:5%;left:11%;transform:translate(0%,0%);z-index:1;max-width:200px;z-index:2}.numB{background-color:#409C2C}table.svelte-1fea0lf{position:relative;background:url(\"data:image/svg+xml,%3C%3Fxml version='1.0' standalone='no'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 20010904//EN' 'http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd'%3E%3Csvg version='1.0' xmlns='http://www.w3.org/2000/svg' width='600.000000pt' height='382.000000pt' viewBox='0 0 600.000000 382.000000' preserveAspectRatio='xMidYMid meet'%3E%3Cmetadata%3E%0ACreated by potrace 1.16, written by Peter Selinger 2001-2019%0A%3C/metadata%3E%3Cg transform='translate(0.000000,382.000000) scale(0.100000,-0.100000)'%0Afill='%23409C2C' fill-opacity='0.08' stroke='none'%3E%3Cpath d='M0 1910 l0 -1910 3000 0 3000 0 0 1910 0 1910 -3000 0 -3000 0 0%0A-1910z m592 1750 c273 -84 408 -377 243 -529 -152 -140 -472 -66 -605 140 -76%0A118 -76 236 1 323 74 83 219 110 361 66z m-48 -814 c83 -41 176 -132 218 -213%0A58 -112 61 -137 59 -463 -2 -439 20 -627 96 -825 54 -142 96 -207 159 -245%0A120 -72 286 -108 418 -89 214 30 475 109 570 173 105 70 156 180 141 299 -16%0A125 -138 412 -262 618 -36 61 -63 112 -61 114 6 6 254 -162 323 -218 86 -70%0A300 -293 367 -381 183 -244 223 -381 147 -501 -66 -104 -290 -178 -619 -206%0A-156 -13 -469 -7 -670 11 -178 17 -347 65 -525 150 -256 121 -402 260 -550%0A519 -159 277 -246 638 -233 967 4 102 7 118 37 179 24 49 45 76 78 98 59 43%0A75 47 169 43 65 -2 93 -8 138 -30z m2106 8 c105 -13 275 -18 765 -23 627 -6%0A630 -6 687 -29 203 -82 337 -305 326 -542 -3 -63 -11 -99 -29 -140 l-25 -54%0A-32 46 c-43 63 -105 114 -171 140 -55 23 -61 23 -432 20 -416 -3 -463 2 -587%0A60 -135 63 -243 216 -280 396 l-17 82 -65 -6 c-421 -37 -763 -128 -885 -235%0A-81 -71 -114 -172 -95 -291 19 -124 135 -394 254 -592 36 -59 66 -112 66 -117%0A0 -12 -241 150 -335 226 -77 61 -287 280 -359 374 -63 81 -145 215 -162 264%0A-8 22 -14 71 -14 109 0 111 40 168 153 222 102 48 284 90 472 110 95 10 636%0A-4 765 -20z m2656 -11 c-3 -21 -16 -107 -28 -190 -13 -84 -26 -153 -31 -153%0A-4 0 -19 12 -32 28 l-24 27 -16 -23 c-97 -136 -299 -315 -515 -457 -128 -84%0A-290 -178 -296 -172 -2 2 60 59 138 128 301 263 480 460 539 594 l21 47 -48%0A49 c-26 27 -45 51 -42 55 8 7 307 102 327 103 10 1 12 -8 7 -36z m-654 -282%0Ac58 -64 138 -185 138 -209 0 -7 -30 -42 -67 -79 -72 -71 -81 -70 -82 3 -1 45%0A-47 196 -77 257 -15 29 -45 79 -68 112 -23 33 -46 66 -51 74 -20 34 152 -98%0A207 -158z m469 -296 c7 -47 10 -87 8 -89 -2 -2 -56 -39 -119 -81 -210 -140%0A-483 -257 -700 -300 -47 -9 -93 -19 -102 -21 -10 -3 -18 -1 -18 3 0 5 37 24%0A83 43 146 59 394 190 519 273 69 46 161 119 212 169 50 48 94 87 97 88 4 0 13%0A-38 20 -85z m-1321 -199 c0 -8 -36 -140 -79 -293 -44 -153 -83 -290 -86 -305%0Al-7 -28 280 0 c252 0 286 2 345 20 84 26 175 93 230 169 l42 59 95 22 c52 12%0A137 36 188 52 52 16 96 28 98 25 2 -2 0 -48 -6 -102 -40 -353 -215 -607 -496%0A-719 -178 -71 -155 -69 -831 -73 l-612 -4 9 28 c5 15 82 276 170 578 88 303%0A163 558 166 568 5 16 26 17 250 17 204 0 244 -2 244 -14z m1224 -101 c9 -35%0A16 -68 16 -73 0 -14 -144 -76 -255 -111 -205 -63 -426 -97 -737 -111 -257 -12%0A-268 -12 -268 0 0 6 19 10 43 10 72 0 284 29 439 60 250 50 523 152 678 254%0A30 19 58 36 61 36 4 0 14 -29 23 -65z m-1944 -1251 l0 -44 -85 0 -85 0 0 -230%0A0 -230 -50 0 -50 0 0 230 0 230 -85 0 -85 0 0 45 0 44 108 3 c59 2 158 2 220%0A0 l112 -3 0 -45z m-2680 -229 l0 -275 -50 0 -50 0 0 275 0 275 50 0 50 0 0%0A-275z m426 260 c27 -8 58 -20 68 -28 18 -13 18 -15 -3 -55 -12 -23 -23 -42%0A-25 -42 -2 0 -23 9 -47 19 -95 41 -180 33 -187 -18 -6 -36 24 -58 124 -91 123%0A-41 154 -73 154 -160 0 -52 -4 -64 -30 -94 -45 -50 -103 -70 -192 -64 -72 5%0A-136 28 -187 67 l-23 18 21 41 c12 23 24 42 26 42 3 0 23 -12 44 -26 104 -68%0A231 -62 231 11 0 33 -28 52 -125 85 -100 34 -140 65 -156 122 -19 74 15 139%0A91 172 45 20 152 20 216 1z m533 -15 c145 -81 107 -314 -57 -349 -29 -6 -84%0A-11 -122 -11 l-70 0 0 -80 0 -80 -50 0 -50 0 0 276 0 276 153 -4 c140 -3 155%0A-5 196 -28z m559 -5 c91 -50 142 -135 142 -239 0 -108 -48 -190 -141 -241 -49%0A-27 -62 -30 -149 -30 -78 0 -102 4 -135 22 -62 32 -121 103 -139 164 -33 109%0A-10 198 68 275 68 66 118 84 221 81 66 -3 90 -8 133 -32z m548 20 c84 -25 124%0A-82 124 -177 0 -64 -31 -132 -71 -155 -16 -10 -29 -20 -29 -23 0 -4 25 -42 55%0A-85 30 -44 55 -83 55 -88 0 -4 -26 -7 -57 -5 l-57 3 -46 77 -45 78 -72 0 -73%0A0 0 -80 0 -80 -50 0 -50 0 0 275 0 275 133 0 c89 0 150 -5 183 -15z m1006 -1%0Ac25 -8 65 -31 88 -51 119 -102 122 -309 6 -411 -65 -57 -96 -65 -263 -70%0Al-153 -4 0 276 0 276 138 0 c99 0 151 -4 184 -16z m641 -252 c64 -148 117%0A-272 117 -275 0 -4 -24 -7 -53 -7 l-54 0 -24 60 -24 61 -133 -3 -134 -3 -23%0A-55 -23 -55 -52 -3 c-47 -3 -52 -1 -48 15 3 10 56 134 119 276 l114 257 50 0%0A51 0 117 -268z m507 223 l0 -45 -85 0 -85 0 0 -230 0 -230 -50 0 -50 0 0 230%0A0 230 -85 0 -85 0 0 45 0 45 220 0 220 0 0 -45z m396 -220 c62 -143 114 -266%0A114 -272 0 -9 -17 -13 -50 -13 l-51 0 -26 60 -26 60 -132 0 -132 0 -24 -60%0A-24 -60 -52 0 c-29 0 -53 2 -53 5 0 5 228 524 236 537 3 5 28 8 56 6 l51 -3%0A113 -260z'/%3E%3Cpath d='M1110 565 l0 -105 53 0 c126 1 187 35 187 103 0 71 -57 107 -170 107%0Al-70 0 0 -105z'/%3E%3Cpath d='M1692 649 c-140 -70 -140 -260 1 -328 98 -48 208 -4 252 101 20 49%0A19 84 -4 133 -22 48 -54 79 -103 100 -51 21 -95 19 -146 -6z'/%3E%3Cpath d='M2250 564 l0 -107 83 5 c45 3 94 11 108 18 50 23 68 94 36 144 -21%0A31 -71 46 -159 46 l-68 0 0 -106z'/%3E%3Cpath d='M3250 486 l0 -186 73 0 c77 1 136 17 169 47 65 59 77 178 24 247 -40%0A53 -78 69 -178 74 l-88 4 0 -186z'/%3E%3Cpath d='M3937 623 c-7 -11 -87 -195 -87 -200 0 -2 41 -3 90 -3 50 0 90 4 90%0A8 0 8 -79 194 -85 200 -2 2 -5 -1 -8 -5z'/%3E%3Cpath d='M4798 529 l-46 -109 94 0 93 0 -45 107 c-24 59 -45 108 -47 109 -1 1%0A-23 -47 -49 -107z'/%3E%3C/g%3E%3C/svg%3E%0A\") no-repeat center center fixed;background-size:cover;z-index:100}.logo.svelte-1fea0lf{left:0;width:80px;height:34px;transition:all 0.3s;transform-origin:50% 50%}.head.svelte-1fea0lf{color:#636363;font-size:17px;font-weight:500}.caprght.svelte-1fea0lf{position:absolute;left:10%}.capleft.svelte-1fea0lf{position:absolute;left:2%}.active.svelte-1ishgnu{background-image:linear-gradient(#409C2C 95%, rgb(188, 247, 105) 10%)}.active.svelte-1ishgnu{background-image:linear-gradient(#409C2C 95%, rgb(188, 247, 105) 10%)}";
    			t1 = space();
    			create_component(dropdown.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(link, "href", "https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css");
    			attr_dev(link, "rel", "stylesheet");
    			add_location(link, file, 36, 2, 835);
    			add_location(style, file, 37, 2, 923);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			append_dev(document.head, style);
    			insert_dev(target, t1, anchor);
    			mount_component(dropdown, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*input*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*input*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dropdown.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dropdown.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			detach_dev(style);
    			if (detaching) detach_dev(t1);
    			destroy_component(dropdown, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $race;
    	let $currentRace;
    	validate_store(race, 'race');
    	component_subscribe($$self, race, $$value => $$invalidate(1, $race = $$value));
    	validate_store(currentRace, 'currentRace');
    	component_subscribe($$self, currentRace, $$value => $$invalidate(2, $currentRace = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let calendarDate = 0;

    	calDate.subscribe(value => {
    		$$invalidate(3, calendarDate = value);
    	});

    	let input;
    	let output;

    	async function getData() {
    		const response = await fetch(`https://utxnaxbctngt41y-gra.adb.uk-london-1.oraclecloudapps.com/ords/gra/races/odds?meet=${calendarDate}`);
    		let tData = await response.json();
    		$$invalidate(0, input = tData.items);

    		race.set(input.map((rc, i) => {
    			return rc['race_no'];
    		}));

    		race.subscribe(value => {
    			currentRace.set(value[0]);
    		});
    	}

    	let dd = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Table,
    		race,
    		currentRace,
    		calDate,
    		Dropdown,
    		calendarDate,
    		input,
    		output,
    		getData,
    		dd,
    		$race,
    		$currentRace
    	});

    	$$self.$inject_state = $$props => {
    		if ('calendarDate' in $$props) $$invalidate(3, calendarDate = $$props.calendarDate);
    		if ('input' in $$props) $$invalidate(0, input = $$props.input);
    		if ('output' in $$props) output = $$props.output;
    		if ('dd' in $$props) dd = $$props.dd;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*calendarDate*/ 8) {
    			if (calendarDate !== 0 && calendarDate !== undefined) {
    				getData();
    				console.log(calendarDate);
    			}
    		}

    		if ($$self.$$.dirty & /*input*/ 1) {
    			console.log(input);
    		}
    	};

    	return [input, $race, $currentRace, calendarDate];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.querySelector('#odds-compare')
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const tags_1 = require("./tags");
const tags_list_view_1 = require("./tags-list-view");
var config_1 = require("./config");
exports.config = config_1.config;
let stack;
let disposables;
let active = false;
async function showList(editor, tags) {
    const tag = await tags_list_view_1.selectListView(tags, exports.tagsInstance.inProgress);
    if (tag !== undefined)
        open(editor, tag);
}
function open(editor, tag) {
    const edp = editor.getPath();
    if (edp) {
        stack.push({
            uri: edp,
            line: editor.getLastCursor().getBufferRow(),
            column: editor.getLastCursor().getBufferColumn(),
        });
    }
    void atom.workspace.open(tag.uri, {
        initialLine: tag.line,
        searchAllPanes: true,
    });
}
function activate() {
    active = true;
    stack = [];
    exports.tagsInstance = new tags_1.Tags();
    disposables = new atom_1.CompositeDisposable();
    disposables.add(atom.commands.add('atom-workspace', {
        'ide-haskell-hasktags:show-tags': () => {
            if (!active)
                return;
            const ed = atom.workspace.getActiveTextEditor();
            if (ed)
                void showList(ed, exports.tagsInstance.listTags());
        },
        'ide-haskell-hasktags:go-back': () => {
            const prevpos = stack.pop();
            if (prevpos) {
                void atom.workspace.open(prevpos.uri, {
                    initialLine: prevpos.line,
                    initialColumn: prevpos.column,
                    searchAllPanes: true,
                });
            }
        },
    }));
    disposables.add(atom.commands.add('atom-text-editor', {
        'ide-haskell-hasktags:show-file-tags': ({ currentTarget }) => {
            if (!active)
                return;
            const editor = currentTarget.getModel();
            const path = editor.getPath();
            if (!path)
                return;
            void showList(editor, exports.tagsInstance.listTags(path));
        },
    }));
    disposables.add(atom.contextMenu.add({
        'atom-text-editor[data-grammar~="haskell"]': [
            {
                label: 'Show File Tags',
                command: 'ide-haskell-hasktags:show-file-tags',
            },
        ],
    }));
    disposables.add(atom.menu.add([
        {
            label: 'Haskell IDE',
            submenu: [
                {
                    label: 'Hasktags',
                    submenu: [
                        {
                            label: 'Show Tags',
                            command: 'ide-haskell-hasktags:show-tags',
                        },
                        {
                            label: 'Show File Tags',
                            command: 'ide-haskell-hasktags:show-file-tags',
                        },
                    ],
                },
            ],
        },
    ]));
}
exports.activate = activate;
function consumeUPI(register) {
    const upi = register({
        name: 'ide-haskell-hasktags',
    });
    const disp = new atom_1.CompositeDisposable();
    disposables.add(disp);
    disp.add(upi);
    disp.add(atom.commands.add('atom-text-editor', {
        'ide-haskell-hasktags:go-to-declaration': ({ currentTarget, detail }) => {
            if (!active)
                return;
            const editor = currentTarget.getModel();
            const buffer = editor.getBuffer();
            const er = upi.getEventRange(editor, detail);
            if (!er)
                return;
            const { crange } = er;
            const { start, end } = buffer.rangeForRow(crange.start.row, false);
            const crange2 = { start: crange.start, end: crange.end };
            const left = buffer.getTextInRange([start, crange.start]);
            crange2.start.column = left.search(/[\w']*$/);
            const right = buffer.getTextInRange([crange.end, end]);
            crange2.end.column += right.search(/[^\w']|$/);
            const symbol = buffer.getTextInRange(crange2);
            const tags = exports.tagsInstance.findTag(symbol);
            switch (tags.length) {
                case 0:
                    return;
                case 1:
                    void open(editor, tags[0]);
                    break;
                default:
                    void showList(editor, tags);
            }
        },
    }));
    disp.add(atom.contextMenu.add({
        'atom-text-editor[data-grammar~="haskell"]': [
            {
                label: 'Go to Declaration',
                command: 'ide-haskell-hasktags:go-to-declaration',
            },
        ],
    }));
    return disp;
}
exports.consumeUPI = consumeUPI;
function deactivate() {
    disposables.dispose();
    exports.tagsInstance.destroy();
    active = false;
}
exports.deactivate = deactivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlLWhhc2tlbGwtaGFza3RhZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaWRlLWhhc2tlbGwtaGFza3RhZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBc0Q7QUFDdEQsaUNBQTZCO0FBQzdCLHFEQUFpRDtBQUdqRCxtQ0FBaUM7QUFBeEIsMEJBQUEsTUFBTSxDQUFBO0FBR2YsSUFBSSxLQUlGLENBQUE7QUFDRixJQUFJLFdBQWdDLENBQUE7QUFDcEMsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFBO0FBRWxCLEtBQUssbUJBQW1CLE1BQWtCLEVBQUUsSUFBYztJQUN4RCxNQUFNLEdBQUcsR0FBRyxNQUFNLCtCQUFjLENBQUMsSUFBSSxFQUFFLG9CQUFZLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDL0QsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLFNBQVMsQ0FBQztRQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDMUMsQ0FBQztBQUVELGNBQWMsTUFBa0IsRUFBRSxHQUFXO0lBRTNDLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUM1QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ1IsS0FBSyxDQUFDLElBQUksQ0FBQztZQUNULEdBQUcsRUFBRSxHQUFHO1lBQ1IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxZQUFZLEVBQUU7WUFDM0MsTUFBTSxFQUFFLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxlQUFlLEVBQUU7U0FDakQsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTtRQUNoQyxXQUFXLEVBQUUsR0FBRyxDQUFDLElBQUk7UUFDckIsY0FBYyxFQUFFLElBQUk7S0FDckIsQ0FBQyxDQUFBO0FBQ0osQ0FBQztB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QUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUM5QyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQzdDLE1BQU0sSUFBSSxHQUFHLG9CQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ3pDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixLQUFLLENBQUM7b0JBQ0osTUFBTSxDQUFBO2dCQUNSLEtBQUssQ0FBQztvQkFDSixLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7b0JBQzFCLEtBQUssQ0FBQTtnQkFDUDtvQkFDRSxLQUFLLFFBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDL0IsQ0FBQztRQUNILENBQUM7S0FDRixDQUFDLENBQ0gsQ0FBQTtJQUVELElBQUksQ0FBQyxHQUFHLENBQ04sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7UUFDbkIsMkNBQTJDLEVBQUU7WUFDM0M7Z0JBQ0UsS0FBSyxFQUFFLG1CQUFtQjtnQkFDMUIsT0FBTyxFQUFFLHdDQUF3QzthQUNsRDtTQUNGO0tBQ0YsQ0FBQyxDQUNILENBQUE7SUFFRCxNQUFNLENBQUMsSUFBSSxDQUFBO0FBQ2IsQ0FBQztBQWxERCxnQ0FrREM7QUFFRDtJQUNFLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUNyQixvQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3RCLE1BQU0sR0FBRyxLQUFLLENBQUE7QUFDaEIsQ0FBQztBQUpELGdDQUlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgVGV4dEVkaXRvciB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBUYWdzIH0gZnJvbSAnLi90YWdzJ1xuaW1wb3J0IHsgc2VsZWN0TGlzdFZpZXcgfSBmcm9tICcuL3RhZ3MtbGlzdC12aWV3J1xuaW1wb3J0IHsgSVVQSVJlZ2lzdHJhdGlvbiB9IGZyb20gJ2F0b20taGFza2VsbC11cGknXG5cbmV4cG9ydCB7IGNvbmZpZyB9IGZyb20gJy4vY29uZmlnJ1xuXG5leHBvcnQgbGV0IHRhZ3NJbnN0YW5jZTogVGFnc1xubGV0IHN0YWNrOiBBcnJheTx7XG4gIHVyaTogc3RyaW5nXG4gIGxpbmU6IG51bWJlclxuICBjb2x1bW46IG51bWJlclxufT5cbmxldCBkaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZVxubGV0IGFjdGl2ZSA9IGZhbHNlXG5cbmFzeW5jIGZ1bmN0aW9uIHNob3dMaXN0KGVkaXRvcjogVGV4dEVkaXRvciwgdGFnczogU3ltUmVjW10pIHtcbiAgY29uc3QgdGFnID0gYXdhaXQgc2VsZWN0TGlzdFZpZXcodGFncywgdGFnc0luc3RhbmNlLmluUHJvZ3Jlc3MpXG4gIGlmICh0YWcgIT09IHVuZGVmaW5lZCkgb3BlbihlZGl0b3IsIHRhZylcbn1cblxuZnVuY3Rpb24gb3BlbihlZGl0b3I6IFRleHRFZGl0b3IsIHRhZzogU3ltUmVjKSB7XG4gIC8vIGVkaXRvciA/PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgY29uc3QgZWRwID0gZWRpdG9yLmdldFBhdGgoKVxuICBpZiAoZWRwKSB7XG4gICAgc3RhY2sucHVzaCh7XG4gICAgICB1cmk6IGVkcCxcbiAgICAgIGxpbmU6IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ2V0QnVmZmVyUm93KCksXG4gICAgICBjb2x1bW46IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ2V0QnVmZmVyQ29sdW1uKCksXG4gICAgfSlcbiAgfVxuICB2b2lkIGF0b20ud29ya3NwYWNlLm9wZW4odGFnLnVyaSwge1xuICAgIGluaXRpYWxMaW5lOiB0YWcubGluZSxcbiAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuICBhY3RpdmUgPSB0cnVlXG4gIHN0YWNrID0gW11cbiAgdGFnc0luc3RhbmNlID0gbmV3IFRhZ3MoKVxuICBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgZGlzcG9zYWJsZXMuYWRkKFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdpZGUtaGFza2VsbC1oYXNrdGFnczpzaG93LXRhZ3MnOiAoKSA9PiB7XG4gICAgICAgIGlmICghYWN0aXZlKSByZXR1cm5cbiAgICAgICAgY29uc3QgZWQgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgaWYgKGVkKSB2b2lkIHNob3dMaXN0KGVkLCB0YWdzSW5zdGFuY2UubGlzdFRhZ3MoKSlcbiAgICAgIH0sXG4gICAgICAnaWRlLWhhc2tlbGwtaGFza3RhZ3M6Z28tYmFjayc6ICgpID0+IHtcbiAgICAgICAgY29uc3QgcHJldnBvcyA9IHN0YWNrLnBvcCgpXG4gICAgICAgIGlmIChwcmV2cG9zKSB7XG4gICAgICAgICAgdm9pZCBhdG9tLndvcmtzcGFjZS5vcGVuKHByZXZwb3MudXJpLCB7XG4gICAgICAgICAgICBpbml0aWFsTGluZTogcHJldnBvcy5saW5lLFxuICAgICAgICAgICAgaW5pdGlhbENvbHVtbjogcHJldnBvcy5jb2x1bW4sXG4gICAgICAgICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pLFxuICApXG4gIGRpc3Bvc2FibGVzLmFkZChcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICdpZGUtaGFza2VsbC1oYXNrdGFnczpzaG93LWZpbGUtdGFncyc6ICh7IGN1cnJlbnRUYXJnZXQgfSkgPT4ge1xuICAgICAgICBpZiAoIWFjdGl2ZSkgcmV0dXJuXG4gICAgICAgIGNvbnN0IGVkaXRvcjogVGV4dEVkaXRvciA9IChjdXJyZW50VGFyZ2V0IGFzIGFueSkuZ2V0TW9kZWwoKVxuICAgICAgICBjb25zdCBwYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICBpZiAoIXBhdGgpIHJldHVyblxuICAgICAgICB2b2lkIHNob3dMaXN0KGVkaXRvciwgdGFnc0luc3RhbmNlLmxpc3RUYWdzKHBhdGgpKVxuICAgICAgfSxcbiAgICB9KSxcbiAgKVxuICBkaXNwb3NhYmxlcy5hZGQoXG4gICAgYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgJ2F0b20tdGV4dC1lZGl0b3JbZGF0YS1ncmFtbWFyfj1cImhhc2tlbGxcIl0nOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ1Nob3cgRmlsZSBUYWdzJyxcbiAgICAgICAgICBjb21tYW5kOiAnaWRlLWhhc2tlbGwtaGFza3RhZ3M6c2hvdy1maWxlLXRhZ3MnLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KSxcbiAgKVxuICBkaXNwb3NhYmxlcy5hZGQoXG4gICAgYXRvbS5tZW51LmFkZChbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnSGFza2VsbCBJREUnLFxuICAgICAgICBzdWJtZW51OiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdIYXNrdGFncycsXG4gICAgICAgICAgICBzdWJtZW51OiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1Nob3cgVGFncycsXG4gICAgICAgICAgICAgICAgY29tbWFuZDogJ2lkZS1oYXNrZWxsLWhhc2t0YWdzOnNob3ctdGFncycsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1Nob3cgRmlsZSBUYWdzJyxcbiAgICAgICAgICAgICAgICBjb21tYW5kOiAnaWRlLWhhc2tlbGwtaGFza3RhZ3M6c2hvdy1maWxlLXRhZ3MnLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICBdKSxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZVVQSShyZWdpc3RlcjogSVVQSVJlZ2lzdHJhdGlvbikge1xuICBjb25zdCB1cGkgPSByZWdpc3Rlcih7XG4gICAgbmFtZTogJ2lkZS1oYXNrZWxsLWhhc2t0YWdzJyxcbiAgfSlcbiAgY29uc3QgZGlzcCA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgZGlzcG9zYWJsZXMuYWRkKGRpc3ApXG4gIGRpc3AuYWRkKHVwaSlcblxuICBkaXNwLmFkZChcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICdpZGUtaGFza2VsbC1oYXNrdGFnczpnby10by1kZWNsYXJhdGlvbic6ICh7IGN1cnJlbnRUYXJnZXQsIGRldGFpbCB9KSA9PiB7XG4gICAgICAgIGlmICghYWN0aXZlKSByZXR1cm5cbiAgICAgICAgY29uc3QgZWRpdG9yOiBUZXh0RWRpdG9yID0gKGN1cnJlbnRUYXJnZXQgYXMgYW55KS5nZXRNb2RlbCgpXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKVxuICAgICAgICBjb25zdCBlciA9IHVwaS5nZXRFdmVudFJhbmdlKGVkaXRvciwgZGV0YWlsKVxuICAgICAgICBpZiAoIWVyKSByZXR1cm5cbiAgICAgICAgY29uc3QgeyBjcmFuZ2UgfSA9IGVyXG4gICAgICAgIGNvbnN0IHsgc3RhcnQsIGVuZCB9ID0gYnVmZmVyLnJhbmdlRm9yUm93KGNyYW5nZS5zdGFydC5yb3csIGZhbHNlKVxuICAgICAgICBjb25zdCBjcmFuZ2UyID0geyBzdGFydDogY3JhbmdlLnN0YXJ0LCBlbmQ6IGNyYW5nZS5lbmQgfVxuICAgICAgICBjb25zdCBsZWZ0ID0gYnVmZmVyLmdldFRleHRJblJhbmdlKFtzdGFydCwgY3JhbmdlLnN0YXJ0XSlcbiAgICAgICAgY3JhbmdlMi5zdGFydC5jb2x1bW4gPSBsZWZ0LnNlYXJjaCgvW1xcdyddKiQvKVxuICAgICAgICBjb25zdCByaWdodCA9IGJ1ZmZlci5nZXRUZXh0SW5SYW5nZShbY3JhbmdlLmVuZCwgZW5kXSlcbiAgICAgICAgY3JhbmdlMi5lbmQuY29sdW1uICs9IHJpZ2h0LnNlYXJjaCgvW15cXHcnXXwkLylcbiAgICAgICAgY29uc3Qgc3ltYm9sID0gYnVmZmVyLmdldFRleHRJblJhbmdlKGNyYW5nZTIpXG4gICAgICAgIGNvbnN0IHRhZ3MgPSB0YWdzSW5zdGFuY2UuZmluZFRhZyhzeW1ib2wpXG4gICAgICAgIHN3aXRjaCAodGFncy5sZW5ndGgpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICB2b2lkIG9wZW4oZWRpdG9yLCB0YWdzWzBdKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdm9pZCBzaG93TGlzdChlZGl0b3IsIHRhZ3MpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSksXG4gIClcblxuICBkaXNwLmFkZChcbiAgICBhdG9tLmNvbnRleHRNZW51LmFkZCh7XG4gICAgICAnYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXJ+PVwiaGFza2VsbFwiXSc6IFtcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnR28gdG8gRGVjbGFyYXRpb24nLFxuICAgICAgICAgIGNvbW1hbmQ6ICdpZGUtaGFza2VsbC1oYXNrdGFnczpnby10by1kZWNsYXJhdGlvbicsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pLFxuICApXG5cbiAgcmV0dXJuIGRpc3Bcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICB0YWdzSW5zdGFuY2UuZGVzdHJveSgpXG4gIGFjdGl2ZSA9IGZhbHNlXG59XG4iXX0=
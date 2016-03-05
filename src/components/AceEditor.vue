<template lang="jade">
  editor
    div {{* file.content}}
    status-bar
      item {{file.path}}
      mode-selector(:model.sync="status.mode")
      item.right {{status.row}}:{{status.column}}
</template>

<script>
import PubSub from 'pubsub-js'
import ModeSelector from './ModeSelector'

var extNames = {
  js: 'javascript', json: 'json', jsx: 'jsx', coffee: 'coffee', dart: 'dart',
  html: 'html', htm: 'html', jade: 'jade',
  css: 'css', less: 'less', scss: 'scss', sass: 'sass', stylus: 'stylus',
  ini: 'ini', txt: 'text', py: 'python', java: 'java', rb: 'ruby',
  jsp: 'jsp', php: 'php', c: 'c_cpp', cpp: 'c_cpp',
  sh: 'sh', lisp: 'lisp', d: 'd', diff: 'diff',
  lua: 'lua', sql: 'sql', svg: 'svg', xml: 'xml', md: 'markdown',
  tex: 'tex', yaml: 'yaml', ts: 'typescript'
}
var supportLang = [
  'abap','html','powershell','abc','html_ruby','praat','actionscript','ini','prolog',
  'ada','io','properties','apache_conf','jack','protobuf','applescript','jade',
  'python','asciidoc','java','r','assembly_x86','javascript','rdoc',
  'autohotkey','json','rhtml','batchfile','jsoniq','ruby','c9search','jsp',
  'rust','c_cpp','jsx','sass','cirru','julia','scad','clojure','latex',
  'scala','cobol','lean','scheme','coffee','less','scss','coldfusion',
  'liquid','sh','csharp','lisp','sjs','css','live_script','smarty','curly',
  'livescript','snippets','d','logiql','soy_template','dart','lsl','space','diff',
  'lua','sql','django','luapage','sqlserver','dockerfile','lucene','stylus',
  'dot','makefile','svg','eiffel','markdown','swift','ejs','mask','swig',
  'elixir','matlab','tcl','elm','maze','tex','erlang','mel','text','forth',
  'mips_assembler','textile','ftl','mipsassembler','toml','gcode','mushcode',
  'twig','gherkin','mysql','typescript','gitignore','nix','vala','glsl',
  'objectivec','vbscript','golang','ocaml','velocity','groovy','pascal',
  'verilog','haml','perl','vhdl','handlebars','pgsql','xml','haskell',
  'php','xquery','haxe','plain_text','yaml'
]
function getExtName (name) {
  if (name == null) {
    return 'unknown'
  } else {
    var lastIndex = name.lastIndexOf('.')
    if (lastIndex <= 0 || lastIndex == name.length - 1) {
      return 'text'
    } else {
      return name.substring(lastIndex + 1)
    }
  }
}

export default {
  props: ['file'],
  data () {
    return {
      status: {
        row: 1,
        column: 1,
        mode: 'text'
      }
    }
  },
  attached () {
    var extName = getExtName(this.file.name)
    this.status.mode = extNames[extName] || 'text'

    var editor = this._editor = ace.edit(this.$el.firstChild)
  	editor.setTheme("ace/theme/monokai_new")
  	editor.session.setMode("ace/mode/"+this.status.mode)
    //editor.session.setUseWrapMode(true);
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true
    })
    editor.commands.addCommand({
      name: 'saveFile',
      bindKey: {
        win: 'Ctrl-S',
        mac: 'Command-S',
        sender: 'editor|cli'
      },
      exec: (env, args, request) => {
        PubSub.publish('save-file')
      }
    })
  	editor.commands.on('afterExec', function(e){
  	  if (e.command.name == 'insertstring'&&/^[\w.]$/.test(e.args)) {
  		  editor.execCommand('startAutocomplete')
  	  }
  	})
    editor.on('change', (content) => {
      this.file.isTemp = false
      this.file.content = editor.getValue()
      this.file.isDirty = this.file.preContent != this.file.content
    })
    editor.session.selection.on('changeCursor',() => {
      var position = editor.getCursorPosition()
      this.status.row = position.row + 1
      this.status.column = position.column + 1
    })
    editor.focus()

    this.tokens = {
      undo: PubSub.subscribe('edit-undo', () => {
        if (this.file.active) {
          editor.execCommand('undo')
        }
      }),
      redo: PubSub.subscribe('edit-redo', () => {
        if (this.file.active) {
          editor.execCommand('redo')
        }
      }),
      cut: PubSub.subscribe('edit-cut', () => {
        if (this.file.active) {
          editor.execCommand('cut')
        }
      }),
      copy: PubSub.subscribe('edit-copy', () => {
        if (this.file.active) {
          editor.execCommand('copy');
        }
      }),
      paste: PubSub.subscribe('edit-paste', () => {
        if (this.file.active) {
          editor.execCommand('paste')
        }
      }),
      selectAll: PubSub.subscribe('edit-select-all', () => {
        if (this.file.active) {
          editor.execCommand('selectall')
        }
      })
    }
  },
  destroyed () {
    for (let key in this.tokens) {
      PubSub.unsubscribe(this.tokens[key])
    }
    this._editor.destroy()
  },
  watch: {
    'file.active' (val, oldVal) {
      if (val == true) {
        this._editor.focus()
      }
    },
    'status.mode' (val, oldVal) {
      this._editor.session.setMode("ace/mode/"+this.status.mode)
    }
  },
  components: {
    ModeSelector
  }
}
</script>

<template lang="jade">
mode-selector(@click="onClick")
  text(@click="onTextClick") {{model}}
  list(:class="{show:show}")
    item(v-for="lang in langs", @click="onSelect(lang)", :class="{selected: lang==model}") {{lang}}
</template>
<script>
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
].sort()
export default {
  props: ['model'],
  data () {
    return {
      langs: supportLang,
      show: false
    }
  },
  methods: {
    onSelect (lang) {
      this.model = lang
      this.show = false
    },
    onTextClick () {
      this.show = !this.show
    },
    onClick () {
      this._clicked = true
    }
  },
  attached () {
    this._documentClick = () => {
      if (!this._clicked) {
        this.show = false
      }
      this._clicked = false
    }
    document.addEventListener('click', this._documentClick, false)
  },
  destroyed () {
    document.removeEventListener(this._chicked)
  }
}
</script>

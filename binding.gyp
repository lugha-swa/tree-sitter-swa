{
  "targets": [
    {
      "target_name": "tree_sitter_swa_binding",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "src"
      ],
      "sources": [
        "bindings/node/binding.cc",
        "src/parser.c"
      ],
      "cflags_c": ["-std=c11"],
      "defines": ["_GNU_SOURCE"]
    }
  ]
}

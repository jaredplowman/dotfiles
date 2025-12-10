atuin_setup() {
  if ! command -v atuin &>/dev/null; then return 1; fi

  export ATUIN_NOBIND="true"
  eval "$(atuin init bash)"

  # Ctrl+E -> standard atuin search widget
  atuin_search_widget() {
    local selected
    local fzf_opts=(
      --height="${FZF_TMUX_HEIGHT:-80%}"
      --tac
      "--query=${READLINE_LINE}"
    )
    selected="$(atuin search --cmd-only | fzf "${fzf_opts[@]}")"
    if [[ -n "$selected" ]]; then
      READLINE_LINE="${READLINE_LINE:0:$READLINE_POINT}${selected}${READLINE_LINE:$READLINE_POINT}"
      READLINE_POINT=$((READLINE_POINT + ${#selected}))
    fi
  }
  bind -x '"\C-e": atuin_search_widget'

  # Ctrl+R -> fzf enhanced atuin search
  fzf_atuin_history_widget() {
    local selected
    local atuin_opts="--cmd-only"
    local fzf_opts=(
      --height="${FZF_TMUX_HEIGHT:-80%}"
      --tac
      "-n2..,.."
      --tiebreak=index
      "--query=${READLINE_LINE}"
      "+m"
      "--bind=ctrl-d:reload(atuin search $atuin_opts -c $PWD),ctrl-r:reload(atuin search $atuin_opts)"
    )

    selected="$(atuin search $atuin_opts | fzf "${fzf_opts[@]}")"
    if [[ -n "$selected" ]]; then
      READLINE_LINE="${READLINE_LINE:0:$READLINE_POINT}${selected}${READLINE_LINE:$READLINE_POINT}"
      READLINE_POINT=$((READLINE_POINT + ${#selected}))
    fi
  }
  bind -x '"\C-r": fzf_atuin_history_widget'
}
atuin_setup

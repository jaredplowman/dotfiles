#Requires AutoHotkey v2.0
#SingleInstance Force

; Windows virtual desktops (Ctrl+Shift+1 through Ctrl+Shift+4).
^+1::SwitchToDesktop(1)
^+2::SwitchToDesktop(2)
^+3::SwitchToDesktop(3)
^+4::SwitchToDesktop(4)

SwitchToDesktop(target) {
    state := GetDesktopState()
    if !state.Length
        return

    ; Win+Ctrl+D creates a desktop and switches to it.
    while (state[1] < target) {
        previousCount := state[1]
        Send "^#d"
        Loop 20 {
            Sleep 50
            state := GetDesktopState()
            if (state.Length && state[1] > previousCount && state[2] = state[1])
                break
        }
        if (!state.Length || state[1] <= previousCount || state[2] != state[1])
            return
    }

    ; Wait for each move to register before sending another, so we don't overshoot.
    while (state[2] != target) {
        previousIndex := state[2]
        Send state[2] < target ? "^#{Right}" : "^#{Left}"
        Loop 20 {
            Sleep 50
            state := GetDesktopState()
            if (state.Length && state[2] != previousIndex)
                break
        }
        if (!state.Length || state[2] = previousIndex)
            return
    }
}

GetDesktopState() {
    key := "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\VirtualDesktops"
    ids := RegRead(key, "VirtualDesktopIDs", "")
    current := RegRead(key, "CurrentVirtualDesktop", "")
    ; REG_BINARY values are returned as hex: each desktop ID is 16 bytes/32 characters.
    if (!ids || Mod(StrLen(ids), 32) || StrLen(current) != 32)
        return []

    count := StrLen(ids) // 32
    Loop count {
        if (SubStr(ids, (A_Index - 1) * 32 + 1, 32) = current)
            return [count, A_Index]
    }
    return []
}

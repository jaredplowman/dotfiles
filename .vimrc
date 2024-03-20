vnoremap <leader>p "_dP
vnoremap <leader>y "+
nnoremap <leader>y "+y

nnoremap <C-j> <C-d>zz
nnoremap <C-k> <C-u>zz

nnoremap <leader>o o<Esc>0"_D
nnoremap <leader>O O<Esc>0"_D

nnoremap <leader>k <F4>

nnoremap n nzzzv
nnoremap N Nzzzv

# search and replace on word starting empty
nnoremap <leader><leader>c viwy:%s/\<<C-v>\>//gc<left><left><left>

# search and replace on word starting with what you're replacing
nnoremap <leader><leader>r viwy:%s/<C-v>/<C-v>/gc<left><left><left>

# search and replace selected text starting empty
vnoremap <leader><leader>c y:%s/\<<C-v>\>//gc<left><left><left>

# search and replae selected text starting empty
vnoremap <leader><leader>r y:%s/<C-v>/<C-v>/gc<left><left><left>
vnoremap <leader><leader>R y:%s/\<<C-v>\>/<C-v>/gc<left><left><left>

noremap x "_x
noremap <leader>dd "_dd
vnoremap <leader>d "_d

vnoremap <leader>/ y/<C-v><CR>
noremap <leader><leader>q <Esc>:wq!<CR>

nnoremap <leader>i i<CR><Esc>

noremap <leader><leader>a ggVG

vnoremap J :m '>+1<CR>gv=gv<Esc>jV=V
vnoremap K :m '>-2<CR>gv=gv<Esc>kV=V

nnoremap J mzJ`z
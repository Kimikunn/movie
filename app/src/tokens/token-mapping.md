# Design To Token Mapping

Source: `design/movie.pen`

## Colors

| Design Value | Token |
|---|---|
| `#FFFFFF` | `--color-bg-primary`, `--color-text-inverse` |
| `#F4F4F5` | `--color-bg-subtle` |
| `#F5F5F7` | `--color-bg-soft` |
| `#F5F5F7E6` | `--color-bg-overlay` |
| `#000000` | `--color-text-primary`, `--color-bg-inverse` |
| `#71717A` | `--color-text-secondary` |
| `#A1A1AA` | `--color-text-tertiary` |
| `#D4D4D8` | `--color-border-subtle` |
| `#E4E4E7` | `--color-border-soft` |
| `#FFFFFF66` | `--color-border-overlay`, `--stroke-color-overlay` |

## Typography

| Design Field | Token |
|---|---|
| `fontFamily: Inter` | `--font-family-body` |
| `fontFamily: Outfit` | `--font-family-display` |
| `fontSize: 8~88` | `--font-size-*` |
| `fontWeight: 300/500/600/700/800/900` | `--font-weight-*` |
| `lineHeight: 0.85/0.9/0.95/1/1.5` | `--line-height-*` |
| `letterSpacing: -4/-1/-0.5/1/2` | `--letter-spacing-*` |

## Spacing

| Design Field | Token |
|---|---|
| `gap` top values: `8/6/10/12/4/2` | `--space-8`, `--space-6`, `--space-10`, `--space-12`, `--space-4`, `--space-2` |
| `padding` top values: `12/10/24/14/20/4/6/8/16` | Matching `--space-*` tokens |

## Radius / Shadow / Stroke

| Design Field | Token |
|---|---|
| `cornerRadius` values `6/8/9/10/12/14/16/18/21/24/36/999` | `--radius-*` |
| `effect shadow color #00000014 blur 8` | `--shadow-elev-1` |
| `effect shadow color #00000052 blur 10` | `--shadow-elev-2` |
| `stroke thickness 2 fill #FFFFFF66` | `--stroke-width-default`, `--stroke-color-overlay` |

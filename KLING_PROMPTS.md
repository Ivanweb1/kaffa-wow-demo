# Ролики для KAFFA: что сгенерировать до Codex

Схема как у MIRRA. 4 опорных кадра генерирует Codex (шаг 1 в `CODEX_PROMPT.md`) и кладёт в `frames/`. Потом из них делаем 3 ролика в Kling: каждый идёт от одного кадра к следующему (start frame → end frame). Так ролики стыкуются без скачков.

Формат везде 16:9, 1920×1080. Ролики 5 с, 1280×720 или выше.
**Расход Kling: 3 видео × ~30 кредитов. Запускать только после «да» Ивана.**

Общий стиль для всех кадров (дописывать в конец каждого промпта):
> premium product photography, soft warm window light from the left with gentle shadows, matte surfaces, muted earthy palette of cream #EDE6DA, espresso brown #2B1D16 and terracotta #B5562F, shallow depth of field, minimal composition, product centered with empty space on the left third for text, no text, no logos, no people, photorealistic, 16:9

## Опорные кадры (сохранить в `frames/`)

| Файл | Промпт |
|---|---|
| `0-beans.png` | Coffee beans frozen mid-air, falling from the top of the frame towards an empty spot in the center on a plain cream seamless backdrop |
| `1-grind.png` | A matte cream-and-steel burr coffee grinder with a walnut wood knob standing in the center on a cream seamless backdrop, a few coffee beans falling into its hopper from above |
| `2-pour.png` | A glass pour-over dripper with paper filter on a glass carafe in the center, a matte steel gooseneck kettle tilted from the top right pouring a thin stream of hot water, light steam, warm terracotta-brown seamless backdrop, coffee dripping into the carafe |
| `3-sip.png` | A handmade glazed ceramic coffee mug with black coffee on a walnut wooden table, warm beige backdrop, two matte coffee bags with blank labels standing behind it slightly out of focus |

## Ролики (сохранить в `video/`)

| Файл | Старт → финиш | Промпт движения |
|---|---|---|
| `1-beans-to-grind.mp4` | `0-beans` → `1-grind` | Coffee beans fall down in slow motion, the grinder rises up from below the frame into the center and catches the beans in its hopper, camera static, smooth |
| `2-grind-to-pour.mp4` | `1-grind` → `2-pour` | The grinder grinds, a stream of ground coffee pours from its spout downwards, the camera follows the stream down into a paper filter, the backdrop color shifts from cream to warm terracotta brown, a gooseneck kettle enters from the top right and starts pouring water, smooth continuous camera move |
| `3-pour-to-sip.mp4` | `2-pour` → `3-sip` | Brewed coffee flows from the carafe in a wide glossy wave towards the camera and fills the frame, the wave settles into a ceramic mug on a wooden table, coffee bags appear behind, smooth continuous camera move, slow motion liquid |

Последний кадр каждого ролика должен совпадать с финишным PNG: Codex ставит PNG как чёткий постер в точках остановки.

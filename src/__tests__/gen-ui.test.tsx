import { Linking } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Box, Button, DateInput, Select } from '@sudobility/components-rn';
import { GenUI } from '../gen-ui';
import { ViewLayout, type IRenderable } from '../types';

// These mirror the web `@sudobility/genui` suite (`src/__tests__/gen-ui.test.tsx`)
// case for case, then cover what the two renderers must agree on beyond it.

const classNameOf = (element: { props: { className?: string } }): string =>
  element.props.className ?? '';

describe('GenUI', () => {
  it('renders a simple titled render tree', () => {
    const renderable: IRenderable = {
      id: 'article',
      view: {
        layout: ViewLayout.LINE_TITLE_SUBTITLE_VALUE,
        title: { text: 'Inbox Zero' },
        subtitle: { text: 'Keep mail under control' },
        valueText: { text: '12' },
      },
    };

    render(<GenUI renderable={renderable} />);

    expect(screen.getByText('Inbox Zero')).toBeTruthy();
    expect(screen.getByText('Keep mail under control')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
  });

  it('accepts the web googleMapsApiKey prop', () => {
    const renderable: IRenderable = {
      id: 'article',
      view: { layout: ViewLayout.LINE_TITLE, title: { text: 'Hello' } },
    };

    render(<GenUI renderable={renderable} googleMapsApiKey='key' />);

    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('draws no chrome of its own around the tree', () => {
    const renderable: IRenderable = {
      id: 'article',
      view: { layout: ViewLayout.LINE_TITLE, title: { text: 'Hello' } },
    };

    render(<GenUI renderable={renderable} className='max-w-xl' />);

    const root = screen.UNSAFE_getAllByType(Box)[0];
    expect(classNameOf(root)).toBe('w-full max-w-xl');
  });

  it('invokes onAction for actionable controls using destination.value', () => {
    const onAction = jest.fn();
    const renderable: IRenderable = {
      id: 'open-compose',
      view: {
        layout: ViewLayout.ACTION,
        title: { text: 'Compose' },
      },
      destination: {
        value: 'compose',
      },
    };

    render(<GenUI renderable={renderable} onAction={onAction} />);

    fireEvent.press(screen.getByRole('button'));

    expect(onAction).toHaveBeenCalledWith('compose', renderable);
  });

  it('disables an action that has no value to report', () => {
    const onAction = jest.fn();
    const renderable: IRenderable = {
      id: 'no-value',
      view: { layout: ViewLayout.ACTION, title: { text: 'Nothing' } },
    };

    render(<GenUI renderable={renderable} onAction={onAction} />);

    fireEvent.press(screen.getByRole('button'));

    expect(onAction).not.toHaveBeenCalled();
  });

  it('reports text input changes through onAction', () => {
    const onAction = jest.fn();
    const renderable: IRenderable = {
      id: 'subject',
      view: {
        layout: ViewLayout.INPUT_TEXT,
        title: { text: 'Subject' },
        valueText: { text: 'Draft' },
      },
    };

    render(<GenUI renderable={renderable} onAction={onAction} />);

    fireEvent.changeText(screen.getByLabelText('Subject'), 'Updated subject');

    expect(onAction).toHaveBeenCalledWith('Updated subject', renderable);
  });

  it('reports an input initial value on mount, and nothing when it is empty', () => {
    const onAction = jest.fn();
    const filled: IRenderable = {
      id: 'subject',
      view: {
        layout: ViewLayout.INPUT_TEXT,
        title: { text: 'Subject' },
        valueText: { text: 'Draft' },
      },
    };
    const empty: IRenderable = {
      id: 'body',
      view: { layout: ViewLayout.INPUT_TEXT_BLOCK, title: { text: 'Body' } },
    };

    render(<GenUI renderable={filled} onAction={onAction} />);
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith('Draft', filled);

    onAction.mockClear();
    render(<GenUI renderable={empty} onAction={onAction} />);
    expect(onAction).not.toHaveBeenCalled();
  });

  it('uses the helper as placeholder only, not as extra text', () => {
    const renderable: IRenderable = {
      id: 'subject',
      view: {
        layout: ViewLayout.INPUT_TEXT,
        title: { text: 'Subject' },
        subtitle: { text: 'What is this about?' },
      },
    };

    render(<GenUI renderable={renderable} />);

    expect(screen.getByPlaceholderText('What is this about?')).toBeTruthy();
    expect(screen.queryByText('What is this about?')).toBeNull();
  });

  it('renders input_date as a date picker reporting YYYY-MM-DD', () => {
    const onAction = jest.fn();
    const renderable: IRenderable = {
      id: 'due',
      view: {
        layout: ViewLayout.INPUT_DATE,
        title: { text: 'Due' },
        valueText: { text: '2026-03-09' },
      },
    };

    render(<GenUI renderable={renderable} onAction={onAction} />);

    const picker = screen.UNSAFE_getByType(DateInput);
    // Shown as the local day that was sent, not the UTC one.
    const shown = picker.props.value as Date;
    expect([
      shown.getFullYear(),
      shown.getMonth() + 1,
      shown.getDate(),
    ]).toEqual([2026, 3, 9]);

    fireEvent(picker, 'change', '2026-04-01');

    expect(onAction).toHaveBeenLastCalledWith('2026-04-01', renderable);
  });

  it('reports toggle changes through onAction', () => {
    const onAction = jest.fn();
    const renderable: IRenderable = {
      id: 'notifications',
      view: {
        layout: ViewLayout.LINE_TOGGLE,
        title: { text: 'Notifications' },
        valueText: { text: '0' },
      },
    };

    render(<GenUI renderable={renderable} onAction={onAction} />);

    // The initial value is reported on mount.
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith('false', renderable);

    fireEvent(screen.getByRole('switch'), 'valueChange', true);

    expect(onAction).toHaveBeenLastCalledWith('true', renderable);
  });

  it('reports slider changes through onAction', () => {
    const onAction = jest.fn();
    const renderable: IRenderable = {
      id: 'volume',
      view: {
        layout: ViewLayout.LINE_SLIDER,
        title: { text: 'Volume' },
        valueText: { text: '30' },
      },
    };

    render(<GenUI renderable={renderable} onAction={onAction} />);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith('30', renderable);

    fireEvent(screen.getByTestId('slider'), 'valueChange', 42.4);

    expect(onAction).toHaveBeenLastCalledWith('42', renderable);
    expect(screen.getByText('42')).toBeTruthy();
  });

  describe('select', () => {
    const renderable: IRenderable = {
      id: 'priority',
      view: {
        layout: ViewLayout.LINE_SELECT,
        title: { text: 'Priority' },
        valueText: { text: 'normal' },
        children: [
          {
            id: 'priority-low',
            view: { title: { text: 'Low' } },
            destination: { value: 'low' },
          },
          {
            id: 'priority-normal',
            view: { title: { text: 'Normal' } },
            destination: { value: 'normal' },
          },
          {
            id: 'priority-high',
            view: { title: { text: 'High' } },
            destination: { value: 'high' },
          },
        ],
      },
    };

    it('reports select changes through onAction', () => {
      const onAction = jest.fn();

      render(<GenUI renderable={renderable} onAction={onAction} />);

      fireEvent(screen.UNSAFE_getByType(Select), 'valueChange', 'high');

      // The option's label, not its value.
      expect(onAction).toHaveBeenLastCalledWith('High', renderable);
    });

    it('reports the default option label on mount', () => {
      const onAction = jest.fn();

      render(<GenUI renderable={renderable} onAction={onAction} />);

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledWith('Normal', renderable);
    });

    it('shows the option that was picked', () => {
      render(<GenUI renderable={renderable} />);

      expect(screen.UNSAFE_getByType(Select).props.value).toBe('normal');

      fireEvent(screen.UNSAFE_getByType(Select), 'valueChange', 'high');

      expect(screen.UNSAFE_getByType(Select).props.value).toBe('high');
    });

    it('has no default when the first option carries no value', () => {
      const onAction = jest.fn();
      const bare: IRenderable = {
        id: 'size',
        view: {
          layout: ViewLayout.LINE_SELECT,
          title: { text: 'Size' },
          children: [
            { id: 'size-s', view: { title: { text: 'Small' } } },
            { id: 'size-l', view: { title: { text: 'Large' } } },
          ],
        },
      };

      render(<GenUI renderable={bare} onAction={onAction} />);

      expect(onAction).not.toHaveBeenCalled();
      expect(screen.UNSAFE_getByType(Select).props.value).toBeUndefined();
      expect(screen.UNSAFE_getByType(Select).props.placeholder).toBe(
        'Select an option'
      );
    });
  });

  describe('link', () => {
    let openURL: jest.SpyInstance;

    beforeEach(() => {
      openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    });

    afterEach(() => {
      openURL.mockRestore();
    });

    it('opens the URL and does not report an action', () => {
      const onAction = jest.fn();
      const renderable: IRenderable = {
        id: 'docs',
        view: {
          layout: ViewLayout.LINK,
          title: { text: 'Read the docs' },
          url: { url: 'https://example.com/docs' },
        },
        destination: { value: 'docs' },
      };

      render(<GenUI renderable={renderable} onAction={onAction} />);

      fireEvent.press(screen.getByRole('link'));

      expect(openURL).toHaveBeenCalledWith('https://example.com/docs');
      expect(onAction).not.toHaveBeenCalled();
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('shows the URL when there is no title', () => {
      const renderable: IRenderable = {
        id: 'docs',
        view: {
          layout: ViewLayout.LINK,
          url: { url: 'https://example.com/docs' },
        },
      };

      render(<GenUI renderable={renderable} />);

      expect(screen.getByText('https://example.com/docs')).toBeTruthy();
    });

    it('is plain text without a URL, and nothing without either', () => {
      const titleOnly: IRenderable = {
        id: 'docs',
        view: { layout: ViewLayout.LINK, title: { text: 'Just words' } },
      };
      const empty: IRenderable = {
        id: 'docs',
        view: { layout: ViewLayout.LINK },
      };

      const { unmount } = render(<GenUI renderable={titleOnly} />);
      expect(screen.getByText('Just words')).toBeTruthy();
      expect(screen.queryByRole('link')).toBeNull();
      unmount();

      render(<GenUI renderable={empty} />);
      expect(screen.queryByRole('link')).toBeNull();
      expect(screen.toJSON()).toMatchObject({ children: null });
    });
  });

  it('renders a paragraph title, its details and its children', () => {
    const renderable: IRenderable = {
      id: 'intro',
      view: {
        layout: ViewLayout.PARAGRAPH,
        title: { text: 'Welcome' },
        details: { text: 'Line one\nLine two' },
        valueText: { text: 'not shown' },
        children: [
          {
            id: 'more',
            view: { layout: ViewLayout.LINE_TITLE, title: { text: 'More' } },
          },
        ],
      },
    };

    render(<GenUI renderable={renderable} />);

    expect(screen.getByText('Welcome')).toBeTruthy();
    expect(screen.getByText('Line one\nLine two')).toBeTruthy();
    expect(screen.getByText('More')).toBeTruthy();
    expect(screen.queryByText('not shown')).toBeNull();
  });

  it('renders the children of a footer and of a line', () => {
    const child = (id: string, text: string): IRenderable => ({
      id,
      view: { layout: ViewLayout.LINE_TITLE, title: { text } },
    });
    const renderable: IRenderable = {
      id: 'page',
      view: {
        layout: ViewLayout.STACKED_VERTICAL,
        children: [
          {
            id: 'line',
            view: {
              layout: ViewLayout.LINE_TITLE_VALUE,
              title: { text: 'Row' },
              children: [child('line-child', 'Inside the row')],
            },
          },
          {
            id: 'footer',
            view: {
              layout: ViewLayout.FOOTER,
              children: [child('footer-child', 'Inside the footer')],
            },
          },
        ],
      },
    };

    render(<GenUI renderable={renderable} />);

    expect(screen.getByText('Inside the row')).toBeTruthy();
    expect(screen.getByText('Inside the footer')).toBeTruthy();
  });

  it('adopts children misplaced on the renderable', () => {
    const renderable = {
      id: 'list',
      view: { layout: ViewLayout.LIST },
      children: [
        {
          id: 'row',
          view: { layout: ViewLayout.LINE_TITLE, title: { text: 'Adopted' } },
        },
      ],
    } as unknown as IRenderable;

    render(<GenUI renderable={renderable} />);

    expect(screen.getByText('Adopted')).toBeTruthy();
  });

  it('falls back to a basic card for an unknown layout', () => {
    const renderable: IRenderable = {
      id: 'mystery',
      view: {
        layout: 'not_a_layout',
        title: { text: 'Unknown' },
        valueText: { text: 'value' },
        children: [
          {
            id: 'inner',
            view: { layout: ViewLayout.LINE_TITLE, title: { text: 'Inner' } },
          },
        ],
      },
    };

    render(<GenUI renderable={renderable} />);

    expect(screen.getByText('Unknown')).toBeTruthy();
    expect(screen.getByText('value')).toBeTruthy();
    expect(screen.getByText('Inner')).toBeTruthy();
    // No card chrome: the web fallback is a bare `w-full` container.
    expect(classNameOf(screen.UNSAFE_getAllByType(Box)[1])).toBe('w-full');
  });

  it('renders nothing for a renderable without a view', () => {
    render(<GenUI renderable={{ id: 'empty' }} />);

    expect(screen.toJSON()).toMatchObject({ children: null });
  });

  describe('collections', () => {
    const action = (id: string): IRenderable => ({
      id,
      view: { layout: ViewLayout.ACTION, title: { text: id } },
      destination: { value: id },
    });

    it('joins list rows into one block with square action buttons', () => {
      const renderable: IRenderable = {
        id: 'menu',
        view: {
          layout: ViewLayout.LIST,
          children: [action('one'), action('two')],
        },
      };

      render(<GenUI renderable={renderable} onAction={jest.fn()} />);

      const buttons = screen.UNSAFE_getAllByType(Button);
      expect(buttons).toHaveLength(2);
      buttons.forEach(button =>
        expect(classNameOf(button)).toContain('rounded-none')
      );
      const body = screen
        .UNSAFE_getAllByType(Box)
        .find(box => classNameOf(box).includes('overflow-hidden'));
      expect(classNameOf(body!)).toBe('flex-col overflow-hidden rounded-lg');
    });

    it('keeps the gap and the button rounding outside a list', () => {
      const renderable: IRenderable = {
        id: 'menu',
        view: {
          layout: ViewLayout.STACKED_VERTICAL,
          children: [action('one'), action('two')],
        },
      };

      render(<GenUI renderable={renderable} onAction={jest.fn()} />);

      screen
        .UNSAFE_getAllByType(Button)
        .forEach(button =>
          expect(classNameOf(button)).not.toContain('rounded-none')
        );
      expect(
        screen
          .UNSAFE_getAllByType(Box)
          .some(box => classNameOf(box) === 'flex-col gap-4')
      ).toBe(true);
    });

    it('lays a grid out one column wide, two from md, in 4:3 cells', () => {
      const renderable: IRenderable = {
        id: 'grid',
        view: {
          layout: ViewLayout.GRID,
          children: [action('one'), action('two'), action('three')],
        },
      };

      render(<GenUI renderable={renderable} onAction={jest.fn()} />);

      const cells = screen
        .UNSAFE_getAllByType(Box)
        .filter(box => classNameOf(box).includes('aspect-[4/3]'));
      expect(cells).toHaveLength(3);
      expect(classNameOf(cells[0])).toBe(
        'aspect-[4/3] w-full overflow-hidden md:w-[48%] lg:aspect-video'
      );
    });

    it('draws no border or padding around a collection', () => {
      const renderable: IRenderable = {
        id: 'menu',
        view: {
          layout: ViewLayout.STACKED_VERTICAL,
          title: { text: 'Menu' },
          children: [action('one')],
        },
      };

      render(<GenUI renderable={renderable} onAction={jest.fn()} />);

      screen.UNSAFE_getAllByType(Box).forEach(box => {
        expect(classNameOf(box)).not.toMatch(/\bborder\b|\bp-4\b/);
      });
    });
  });

  describe('map', () => {
    it('says so when there are no locations', () => {
      const renderable: IRenderable = {
        id: 'map',
        view: {
          layout: ViewLayout.MAP,
          title: { text: 'Offices' },
          children: [{ id: 'nowhere', view: { title: { text: 'Nowhere' } } }],
        },
      };

      render(<GenUI renderable={renderable} />);

      expect(screen.getByText('Offices')).toBeTruthy();
      expect(screen.getByText('No locations to display.')).toBeTruthy();
      expect(screen.queryByTestId('map-view')).toBeNull();
    });

    it('reports the pressed pin through onAction', () => {
      const onAction = jest.fn();
      const paris: IRenderable = {
        id: 'paris',
        view: { title: { text: 'Paris' } },
        destination: { value: 'paris' },
        location: { lat: 48.85, long: 2.35 },
      };
      const renderable: IRenderable = {
        id: 'map',
        view: {
          layout: ViewLayout.MAP,
          children: [
            paris,
            {
              id: 'rome',
              view: { title: { text: 'Rome' } },
              location: { lat: 41.9, long: 12.5 },
            },
          ],
        },
      };

      render(<GenUI renderable={renderable} onAction={onAction} />);

      const [first, second] = screen.getAllByTestId('map-marker');
      expect(first.props.title).toBe('Paris');
      first.props.onPress();
      expect(onAction).toHaveBeenCalledWith('paris', paris);
      // A pin with nothing to report is not pressable.
      expect(second.props.onPress).toBeUndefined();
    });

    it('gives a map_pin callout both the subtitle and the details', () => {
      const renderable: IRenderable = {
        id: 'hq',
        view: {
          layout: ViewLayout.MAP_PIN,
          title: { text: 'HQ' },
          subtitle: { text: '1 Main St' },
          details: { text: 'Open 9–5' },
        },
        location: { lat: 1, long: 2 },
      };

      render(<GenUI renderable={renderable} />);

      const marker = screen.getByTestId('map-marker');
      expect(marker.props.title).toBe('HQ');
      expect(marker.props.description).toBe('1 Main St\nOpen 9–5');
    });
  });
});

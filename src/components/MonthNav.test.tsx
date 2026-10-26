import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthNav } from './MonthNav';

describe('MonthNav', () => {
  it('navigates to the previous month', async () => {
    const onChange = vi.fn();
    render(<MonthNav month="2020-01" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Previous month'));
    expect(onChange).toHaveBeenCalledWith('2019-12');
  });

  it('navigates forward when not at the current month', async () => {
    const onChange = vi.fn();
    render(<MonthNav month="2020-01" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Next month'));
    expect(onChange).toHaveBeenCalledWith('2020-02');
  });

  it('cannot go past the current month', () => {
    const d = new Date();
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    render(<MonthNav month={month} onChange={() => {}} />);
    expect(screen.getByLabelText('Next month')).toBeDisabled();
  });
});

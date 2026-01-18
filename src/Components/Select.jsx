export function SelectField({ placeholder, id, options, value, onSelect }){
  return (<section role="dropdown">
    <select defaultValue={value} onChange={onSelect} list={id} id={id}>
      <option value=""> {placeholder}</option>
      {
        options.map((val) => <option key={val}
        >
          {val}
        </option>)
      }
    </select>
  </section>)
}
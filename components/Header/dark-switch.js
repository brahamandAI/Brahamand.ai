import Image from "next/image";

import light from "../../public/images/light/switch/sun-01.svg";
import dark from "../../public/images/light/switch/vector.svg";

const DarkSwitch = ({ isLight, switchTheme }) => {
  return (
    <div id="my_switcher" className="my_switcher">
      <ul onClick={switchTheme}>
        {isLight ? (
          <li>
            <button data-theme="light" className="setColor light">
              <Image src={dark} alt="Sun images" />
            </button>
          </li>
        ) : (
          <li>
            <button data-theme="dark" className="setColor dark">
              <Image src={light} alt="Vector Images" />
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default DarkSwitch;

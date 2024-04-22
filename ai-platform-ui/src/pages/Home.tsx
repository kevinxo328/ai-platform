import { Card, CardTitle } from "@/components/shadcn/ui/card";
import { routes } from "@/router/routes";
import { NavLink } from "react-router-dom";

const Home = () => {
  const cardItems = routes[0].children[0].children?.filter((item) =>
    Object.hasOwn(item, "name")
  );
  return (
    <div className="grid grid-cols-2 gap-4">
      {cardItems &&
        cardItems.map((item) => (
          <Card key={item.path}>
            <NavLink
              to={item.path}
              key={item.name}
              className="p-4 block text-foreground"
            >
              <CardTitle>{item.name}</CardTitle>
            </NavLink>
          </Card>
        ))}
    </div>
  );
};

export default Home;

import * as cable from "./cable/structs";
import {StructClassLoader} from "../_framework/loader";

export function registerClasses(loader: StructClassLoader) { loader.register(cable.Chat);
loader.register(cable.ChatLink);
loader.register(cable.NewChat);
loader.register(cable.NewMsg);
 }

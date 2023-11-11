import re

import os
filenames = [
    (file, file[:-3] + '_original.js')
    for file in os.listdir()
    if file.endswith(".js") and not file.endswith("_original.js")
]

# # backup copy of the files
# print(filenames)
# import shutil
# for fnsrc, fndst in filenames:
#     shutil.copyfile(fnsrc, fndst)
# exit()


_position_pair_regex = r'\[(\d+)(\.\d+)?, *(\d+)(\.\d+)?\]'

position_re = r' *position: *' + _position_pair_regex + r',? *'
tpline_re = r' *midpoint: *' + _position_pair_regex + r',? *'
tpline_midpoint_re = r' *' + _position_pair_regex + r',? *'

# matches = bool(re.match(_wholelinere,_abc))
# print('matches:', matches)

# if matches:
#     fa = re.findall(r'\d+', _abc)
#     n = int(fa[0])
#     print(n)

#     _abc = re.sub(r'(\d+)', str(n+INC), _abc)

# print(_abc)

def renorm(x, inmin, inmax, outmin, outmax):
    return (x - inmin) / (inmax - inmin) * (outmax - outmin) + outmin


# from math import cos, degrees, radians, acos
# def laty_to_coord01y(laty):
#     """ where [0, 45, 90+] -> [0.0, ~0.7, 1.0], 1 is at the top of the map assuming 0 is at bottom """
#     # assert 0 <= laty <= 200
#     # laty = min(laty,90)
#     # invert
#     # laty = 90 - laty
#     assert 0 <= laty <= 90, f'laty {laty} out of range [0, 90]'
#     # coordy = degrees(cos(radians(laty)))
#     coordy = cos(radians(laty))
#     # invert again
#     # coordy = 1 - coordy
#     assert 0 <= coordy <= 1
#     return coordy

# def coord01y_to_laty(coordy):
#     """ where [0, 45, 90+] -> [0.0, ~0.7, 1.0], 1 is at the top of the map assuming 0 is at bottom """
#     # assert 0 <= coordy <= 1, f'coordy: {coordy}'
#     assert 0 <= coordy, f'coordy before min(coordy,1): {coordy}'
#     # coordy = min(coordy,1)
#     assert 0 <= coordy <= 1, f'coordy: {coordy}'
#     # invert
#     # coordy = 1 - coordy
#     # laty = degrees(cos(radians(coordy)))
#     laty = degrees(acos(coordy))
#     assert 0 <= laty <= 90
#     # invert again
#     # laty = 90 - laty
#     # laty = min(laty,90)
#     assert 0 <= laty
#     return laty


## USES WEB MERCATOR PROJECTION https://en.wikipedia.org/wiki/Web_Mercator_projection

from math import degrees, radians, atan, exp, pow, pi, e, log, tan

LATMAX = 2.*atan(pow(e,pi))-pi/2.
LATMAX = degrees(LATMAX)
print('lat max:', LATMAX)
assert 85.051128 < LATMAX <= 85.051129  # the Web Mercator latitude cutoff

ZOOM = 1

def coordy_to_laty(ypix, zoom=ZOOM):
    '''[0, zoompixelbound] -> [latmax, -latmax] to degrees; NOTICE REVERSED ORDER for output.'''
    lat = 2.*atan(pow(e, pi - pow(2,1-zoom) * pi * ypix)) - pi/2
    return degrees(lat)

def laty_to_coordy(lat, zoom=ZOOM):
    '''floor the result if you want to get an integer pixel. See https://en.wikipedia.org/wiki/Web_Mercator_projection#Formulas.
    \n deg to radians [latmax, -latmax] -> [0, zoompixelbound]; NOTICE REVERSED ORDER for input.
    \n zoompixelbound=2 if zoom=1.
    \n In general, zoompixelbound=laty_to_coordy(-LATMAX, zoom)
    '''
    # assert 0 <= lat <= LATMAX, f'lat {lat} not within [0, LATMAX ({LATMAX})]'
    assert -LATMAX <= lat <= LATMAX, f'lat {lat} not within [ - LATMAX, LATMAX ({LATMAX})]'
    lat = radians(lat)
    return 1/(2*pi) * pow(2,zoom) * (pi - log(tan(pi/4 + lat/2)))

ZOOM_PIXEL_BOUND = laty_to_coordy(-LATMAX, ZOOM)
print('zoom pixel bound (lat max\'s coord)', ZOOM_PIXEL_BOUND)  # zoom = 1 --> pixel bound == 2
assert ZOOM_PIXEL_BOUND > 0
# exit()



def transform(pos):
    # return pos

    y, x = pos
    mapcontainer_x_max_bounds = (0, 200)
    # mapcontainer_x_max_bounds = (200, 0)
    # mapcontainer_y_max_bounds = (0, 200)
    mapcontainer_y_max_bounds = (200, 0)

    # 85.051 deg lat puts within one pixel resolution of the height of the original map.png picture when on the map
    # map_actual_y_bounds = (0, 85.051 / 90)
    map_actual_y_bounds = (0, LATMAX / 90)  # range [0, < 0.95)
    map_pixel_y_bounds = (ZOOM_PIXEL_BOUND / 2, ZOOM_PIXEL_BOUND)

    # map1_x_absrange = (1, 8192)
    # map1_y_absrange = (2401, 10592)
    map1_x_absrange = (0, 8191)
    map1_y_absrange = (0, 8191)
    map1_x_offset = 1
    map1_y_offset = 2401
    # map1_y_offset = 2401*4/5

    map2_x_absrange = (0, 10591)
    map2_y_absrange = (0, 10591)


    # convert y from latitude [0, 90+] to [0, 1]
    # y = min(y, 90)  # cap to 90
    y = min(y, LATMAX)  # cap to the 85.051...
    # y = max(y, 0)  # undercap to 0
    # y = laty_to_coord01y(y)  # [0, 90] -> [0, 1]
    # y = laty_to_coordy(y)  # [0, 85.051...] -> [0, 1]
    # assert 0 <= y <= 1
    y = laty_to_coordy(-y)  # [ 85.051..., - 85.051...] -> [0, pixelbound=2]
    assert ZOOM_PIXEL_BOUND / 2 <= y <= ZOOM_PIXEL_BOUND, f'coord y unexpected value {y}'
    # y *= 200  # [0,1] -> [0,200]
    # y = renorm(y, 0, 1, *mapcontainer_y_max_bounds) # [0,1] -> [200,0]
    # y *= 90  # [0,1] -> [0,90]


    # transform from the mapcontainer coordinate bounds to raw within map 1's bounds (relative to map 2 topleft)
    x_m = renorm(x, *mapcontainer_x_max_bounds, *map1_x_absrange)
    # y_m = renorm(y, *mapcontainer_y_max_bounds, *map1_y_absrange)
    # y_m = renorm(y, *map_actual_y_bounds, *map1_y_absrange)
    y_m = renorm(y, *map_actual_y_bounds, *map1_y_absrange)
    # transform from the map 1's bounds to the map 2's bounds (relative to map 2 topleft)
    # x_m = renorm(x_m, *map1_x_absrange, *map2_x_absrange)
    # y_m = renorm(y_m, *map1_y_absrange, *map2_y_absrange)
    # offset the x_m and y_m
    x_m += map1_x_offset
    y_m += map1_y_offset
    # transform raw now assumed to be within map 2's bounds back to the mapcontainer coordinate bounds
    x = renorm(x_m, *map2_x_absrange, *mapcontainer_x_max_bounds)
    # y = renorm(y_m, *map2_y_absrange, *mapcontainer_y_max_bounds)
    y = renorm(y_m, *map2_y_absrange, *map_actual_y_bounds)


    # convert y back into latitude [0, 1] -> [0, 90]
    # assert min(mapcontainer_y_max_bounds) <= y <= max(mapcontainer_y_max_bounds), f'y (coord, before lat): {y}'
    # assert 0 <= y <= 90
    # y = renorm(y, *mapcontainer_y_max_bounds, 0, 1)
    # y /= 90
    # y = coord01y_to_laty(y) # [0, 1] -> [0, 90] and therefore no more than 90
    y = coordy_to_laty(y)  # [ 85.051..., - 85.051...] -> [0, pixelbound=2]
    # y *= 2

    assert 0 <= x <= 200

    return type(pos)((y, x))


def reformat(line: str):
    if bool(re.match(position_re, line)) \
            or bool(re.match(tpline_re, line)) \
            or bool(re.match(tpline_midpoint_re, line)):
        prefix = line.split('[',maxsplit=1)[0]
        suffix = line.rsplit(']',maxsplit=1)[-1]
        pos = re.findall(r'(\d+)(\.\d+)?', line)
        # print(line)
        print(' ', pos)
        pos = tuple(float(''.join(str(b) for b in a)) if len(a[1]) != 0 else int(a[0]) for a in pos)
        # print(pos)
        print(f'  reformat({line!r})...  pos = {pos} ...')
        line = f'{prefix}[{", ".join([str(a) for a in transform(pos)])}]{suffix}'
        print(f'    output: {line!r}')
        # exit()
        return line
    else:
        return line
    

for fndst, fnsrc in filenames:
    print(fnsrc, fndst)
    with open(fnsrc, 'r') as f:
        src_lines = f.readlines()
    out_lines = [
        reformat(line)
        for line in src_lines
    ]
    with open(fndst, 'w') as f:
        f.writelines(out_lines)

exit()

with open('treasurePods-to-rename.txt', 'r') as fin:
    with open('treasurePods-renamed.txt', 'w') as fout:

        for line in fin:
            line = line.rstrip()  # remove newline
            matches = bool(re.match(_wholelinere, line))
            #print('matches:', matches)

            if matches:
                print(line)
                fa = re.findall(r'\d+', line)
                n = int(fa[0])
                print(n)

                line = re.sub(r'(\d+)', str(n+INC), line)

                print(line)
            fout.write(line + '\n')
